import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';
import { config } from '../../config/config.js';

interface Tokens {
    accessToken: string;
    refreshToken: string;
}

/**
 * Creates short-lived access and long-lived refresh tokens for a user.
 */
export const generateAuthTokens = (userId: string | Types.ObjectId): Tokens => {
    const subject = userId.toString();

    const accessToken = jwt.sign(
        { userId: subject },
        config.accessTokenSecret as string,
        { expiresIn: '15m', algorithm: 'HS256' },
    );

    const refreshToken = jwt.sign(
        { userId: subject },
        config.refreshTokenSecret as string,
        { expiresIn: '7d', algorithm: 'HS256' },
    );

    return { accessToken, refreshToken };
};
