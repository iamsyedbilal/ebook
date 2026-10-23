import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import userModel from './userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateAuthTokens } from '../utils/tokenService.js';

const COOKIE_OPTIONS = {
    httpOnly: true, // Blocks XSS attacks by hiding the cookie from frontend JavaScript
    secure: process.env.NODE_ENV === 'production', // Transmits only over HTTPS in production
    sameSite: 'strict' as const, // Prevents CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // Matches token duration (7 days in milliseconds)
};

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

        const { accessToken, refreshToken } = generateAuthTokens(savedUser._id);

        res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

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

        const { accessToken, refreshToken } = generateAuthTokens(user._id);

        res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

        res.status(200).json({ message: 'Login successful', accessToken });
    },
);

/*
    Logout user
*/
const logoutUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict' as const,
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    },
);

/**
 * Refresh Access Token Rotation
 */
const refreshAccessToken = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return next(
                createHttpError(
                    401,
                    'Access denied. No refresh token provided.',
                ),
            );
        }

        try {
            const decoded = jwt.verify(
                refreshToken,
                config.refreshTokenSecret as string,
            ) as { userId: string };

            const user = await userModel.findById(decoded.userId);

            if (!user) {
                return next(
                    createHttpError(401, 'User session no longer exists.'),
                );
            }

            const newAccessToken = jwt.sign(
                { userId: user._id },
                config.accessTokenSecret as string,
                { expiresIn: '15m', algorithm: 'HS256' },
            );

            res.status(200).json({
                success: true,
                accessToken: newAccessToken,
            });
        } catch (error) {
            return next(
                createHttpError(
                    403,
                    'Invalid or expired refresh token. Please login again.',
                ),
            );
        }
    },
);

export { createUser, loginUser, logoutUser, refreshAccessToken };
