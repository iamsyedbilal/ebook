import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

const isAdmin = (...allowedRoles: ('user' | 'admin')[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(
                createHttpError(401, 'Authentication context not found.'),
            );
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                createHttpError(
                    403,
                    'Access denied. You lack permissions for this resource.',
                ),
            );
        }

        next();
    };
};

export default isAdmin;
