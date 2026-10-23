import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import UserModel from '../user/userModel.js';
import type { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import asyncHandler from '../utils/asyncHandler.js';

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

const verifyJWT = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        let token: string | undefined;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(
                createHttpError(
                    401,
                    'Authentication token missing. Please log in to gain access.',
                ),
            );
        }

        try {
            const decoded = jwt.verify(
                token,
                config.accessTokenSecret as string,
            ) as { userId: string };

            const currentUser = await UserModel.findById(decoded.userId);

            if (!currentUser) {
                return next(
                    createHttpError(
                        401,
                        'The account associated with this token no longer exists.',
                    ),
                );
            }

            req.user = currentUser;
            next();
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                return next(
                    createHttpError(
                        401,
                        'Your access token has expired. Please refresh your session.',
                    ),
                );
            }
            return next(
                createHttpError(
                    401,
                    'Invalid authentication token. Access denied.',
                ),
            );
        }
    },
);

export default verifyJWT;
