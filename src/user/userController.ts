import type { Request, Response } from 'express';
import createHttpError from 'http-errors';

const createUser = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        const error = createHttpError(
            400,
            'Name, email, and password are required',
        );
        return res.status(error.statusCode).json({ error: error.message });
    }

    res.json({ message: 'User created successfully' });
};

export { createUser };
