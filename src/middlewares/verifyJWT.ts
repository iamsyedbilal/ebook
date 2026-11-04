import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import asyncHandler from '../utils/asyncHandler.js';
import { config } from '../config/config.js';
import UserModel from '../modules/users/user.model.js';

const verifyJWT = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
        const authorization = req.headers.authorization;
        const [scheme, token] = authorization?.split(' ') ?? [];

        if (scheme !== 'Bearer' || !token) {
            throw createHttpError(
                401,
                'Authentication token missing. Please log in.',
            );
        }

        let decoded: { userId: string };

        try {
            decoded = jwt.verify(
                token,
                config.accessTokenSecret as string,
                { algorithms: ['HS256'] },
            ) as { userId: string };
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw createHttpError(
                    401,
                    'Your access token has expired. Please refresh your session.',
                );
            }

            throw createHttpError(401, 'Invalid authentication token.');
        }

        const currentUser = await UserModel.findById(decoded.userId).select(
            '_id name email role',
        );

        if (!currentUser) {
            throw createHttpError(
                401,
                'The account associated with this token no longer exists.',
            );
        }

        req.user = {
            _id: currentUser._id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,
        };

        next();
    },
);

export default verifyJWT;
