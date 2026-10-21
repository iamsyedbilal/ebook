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

    res.json({ message: 'User created successfully', accessToken });
});

export { createUser };
