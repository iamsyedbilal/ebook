import mongoose from 'mongoose';
import type { User } from './userTypes.js';

const userSchema = new mongoose.Schema<User>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            validate: {
                validator: (value: string) =>
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                message: 'Please provide a valid email address',
            },
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            select: false,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
    },
    {
        timestamps: true,
    },
);

const userModel = mongoose.model<User>('User', userSchema);

export default userModel;
