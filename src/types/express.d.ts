import type { Types } from 'mongoose';
import type { UserRole } from '../modules/users/user.types.js';

declare global {
    namespace Express {
        interface Request {
            user?: {
                _id: Types.ObjectId;
                name: string;
                email: string;
                role: UserRole;
            };
        }
    }
}

export {};
