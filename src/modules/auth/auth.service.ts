import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import UserModel from '../users/user.model.js';
import { config } from '../../config/config.js';
import { generateAuthTokens } from './token.service.js';

interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

interface LoginInput {
    email: string;
    password: string;
}

export const registerUser = async (input: RegisterInput) => {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();

    if (!name || !email || !input.password) {
        throw createHttpError(400, 'Name, email, and password are required.');
    }

    if (input.password.length < 8) {
        throw createHttpError(400, 'Password must be at least 8 characters long.');
    }

    const password = await bcrypt.hash(input.password, 12);
    const user = await UserModel.create({ name, email, password, role: 'user' });
    const tokens = generateAuthTokens(user._id);

    return {
        user: { id: user._id, name: user.name, email: user.email },
        ...tokens,
    };
};

export const loginUser = async (input: LoginInput) => {
    const email = input.email.trim().toLowerCase();
    const user = await UserModel.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(input.password, user.password))) {
        throw createHttpError(401, 'Invalid email or password.');
    }

    return {
        user: { id: user._id, name: user.name, email: user.email },
        ...generateAuthTokens(user._id),
    };
};

export const createAccessTokenFromRefreshToken = async (refreshToken: string) => {
    let decoded: { userId: string };

    try {
        decoded = jwt.verify(
            refreshToken,
            config.refreshTokenSecret as string,
            { algorithms: ['HS256'] },
        ) as { userId: string };
    } catch {
        throw createHttpError(401, 'Invalid or expired refresh token. Please log in again.');
    }

    const user = await UserModel.findById(decoded.userId);

    if (!user) {
        throw createHttpError(401, 'The account associated with this session no longer exists.');
    }

    return jwt.sign(
        { userId: user._id.toString() },
        config.accessTokenSecret as string,
        { expiresIn: '15m', algorithm: 'HS256' },
    );
};
