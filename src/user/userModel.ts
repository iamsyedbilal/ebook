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
            validate: {
                validator: function (value: string) {
                    // Simple email validation regex
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                },
            },
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
    },
    {
        timestamps: true,
    },
);

const userModel = mongoose.model('User', userSchema);

export default userModel;
