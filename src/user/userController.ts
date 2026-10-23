import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import userModel from './userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Create a new user
 */
const createUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return next(
                createHttpError(400, 'Name, email, and password are required'),
            );
        }

        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return next(
                createHttpError(409, 'User with this email already exists'),
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const savedUser = await userModel.create({
            name,
            email,
            password: hashedPassword,
        });

        if (!savedUser) {
            return next(createHttpError(500, 'Failed to create user'));
        }

        const accessToken = jwt.sign(
            { userId: savedUser._id },
            config.accessTokenSecret as string,
            { expiresIn: '7d', algorithm: 'HS256' },
        );

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            accessToken,
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
            },
        });
    },
);

/**
 * Login user
 */

const loginUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(
                createHttpError(400, 'Email and password are required'),
            );
        }

        const user = await userModel.findOne({ email }).select('+password');

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return next(createHttpError(401, 'Invalid email or password'));
        }

        const accessToken = jwt.sign(
            { userId: user._id },
            config.accessTokenSecret as string,
            { expiresIn: '7d', algorithm: 'HS256' },
        );

        res.status(200).json({ message: 'Login successful', accessToken });
    },
);

export { createUser, loginUser };
