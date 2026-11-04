import type { Request, Response } from 'express';
import createHttpError from 'http-errors';
import asyncHandler from '../../utils/asyncHandler.js';
import {
    createAccessTokenFromRefreshToken,
    loginUser as authenticateUser,
    registerUser,
} from './auth.service.js';

const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body ?? {};

    if (
        typeof name !== 'string' ||
        typeof email !== 'string' ||
        typeof password !== 'string'
    ) {
        throw createHttpError(400, 'Name, email, and password are required.');
    }

    const result = await registerUser({ name, email, password });
    res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
    res.status(201).json({
        success: true,
        message: 'User created successfully.',
        accessToken: result.accessToken,
        user: result.user,
    });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};

    if (typeof email !== 'string' || typeof password !== 'string') {
        throw createHttpError(400, 'Email and password are required.');
    }

    const result = await authenticateUser({ email, password });
    res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
    res.status(200).json({
        success: true,
        message: 'Login successful.',
        accessToken: result.accessToken,
        user: result.user,
    });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });

    res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken || typeof refreshToken !== 'string') {
        throw createHttpError(401, 'No refresh token provided. Please log in.');
    }

    const accessToken = await createAccessTokenFromRefreshToken(refreshToken);
    res.status(200).json({ success: true, accessToken });
});
