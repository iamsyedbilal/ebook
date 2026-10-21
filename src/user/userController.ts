import type { Request, Response } from 'express';
import createHttpError from 'http-errors';
import userModel from './userModel.js';

const createUser = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        const error = createHttpError(
            400,
            'Name, email, and password are required',
        );
        return res.status(error.statusCode).json({ error: error.message });
    }

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
        const error = createHttpError(
            409,
            'User with this email already exists',
        );
        return res.status(error.statusCode).json({ error: error.message });
    }

    res.json({ message: 'User created successfully' });
};

export { createUser };
