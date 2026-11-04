import type { Types } from 'mongoose';

export type UserRole = 'user' | 'admin';

export interface User {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    createdAt?: Date;
    updatedAt?: Date;
}
