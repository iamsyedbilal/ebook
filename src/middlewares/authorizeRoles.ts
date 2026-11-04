import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import type { UserRole } from '../modules/users/user.types.js';

const authorizeRoles = (...allowedRoles: UserRole[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(createHttpError(401, 'Authentication required.'));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                createHttpError(403, 'You do not have permission to perform this action.'),
            );
        }

        next();
    };
};

export default authorizeRoles;
