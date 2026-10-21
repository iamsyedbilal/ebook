import type { Request, Response } from 'express';
import createHttpError from 'http-errors';
import userModel from './userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import asyncHandler from '../utils/asyncHandler.js';

const createUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        const error = createHttpError(
            400,
            'Name, email, and password are required',
        );
        return res.status(error.statusCode).json({ error: error.message });
    }

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
        const error = createHttpError(
            409,
            'User with this email already exists',
        );
        return res.status(error.statusCode).json({ error: error.message });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
        name,
        email,
        password: hashedPassword,
    });

    const savedUser = await newUser.save();

    if (!savedUser) {
        const error = createHttpError(500, 'Failed to create user');
        return res.status(error.statusCode).json({ error: error.message });
    }

    const accessToken = jwt.sign(
        { userId: savedUser._id },
        config.accessTokenSecret as string,
        { expiresIn: '7d', algorithm: 'HS256' },
    );

    res.status(201).json({ message: 'User created successfully', accessToken });
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        const error = createHttpError(400, 'Email and password are required');
        return res.status(error.statusCode).json({ error: error.message });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
        const error = createHttpError(401, 'Invalid email or password');
        return res.status(error.statusCode).json({ error: error.message });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        const error = createHttpError(401, 'Invalid email or password');
        return res.status(error.statusCode).json({ error: error.message });
    }

    const accessToken = jwt.sign(
        { userId: user._id },
        config.accessTokenSecret as string,
        { expiresIn: '7d', algorithm: 'HS256' },
    );

    res.json({ message: 'Login successful', accessToken });
});

export { createUser, loginUser };
