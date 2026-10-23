import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';
import { config } from '../config/config.js';

interface Tokens {
    accessToken: string;
    refreshToken: string;
}

/**
 * Generates both short-lived Access Tokens and long-lived Refresh Tokens for a user
 * @param userId - The MongoDB ObjectId string of the user
 */
export const generateAuthTokens = (userId: string | Types.ObjectId): Tokens => {
    // 1. Short-lived Access Token (15m)
    const accessToken = jwt.sign(
        { userId: userId.toString() },
        config.accessTokenSecret as string,
        { expiresIn: '15m', algorithm: 'HS256' },
    );

    // 2. Long-lived Refresh Token (7d)
    const refreshToken = jwt.sign(
        { userId: userId.toString() },
        config.refreshTokenSecret as string,
        { expiresIn: '7d', algorithm: 'HS256' },
    );

    return { accessToken, refreshToken };
};
