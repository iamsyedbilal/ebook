import type { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { config } from '../config/config.js';

const globalErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    const err = error as Error & {
        status?: number;
        statusCode?: number;
        code?: number;
        keyValue?: Record<string, unknown>;
    };

    let statusCode = err.statusCode ?? err.status ?? 500;
    let message = err.message || 'Something went wrong.';

    if (err instanceof mongoose.Error.ValidationError) {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((validationError) => validationError.message)
            .join(', ');
    } else if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
        message = `A record with this ${field} already exists.`;
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid resource identifier.';
    } else if (err.name === 'MulterError') {
        statusCode = 400;
        message = err.message;
    }

    const response: {
        success: false;
        message: string;
        stack?: string;
    } = {
        success: false,
        message: statusCode >= 500 && config.env === 'production'
            ? 'Internal server error.'
            : message,
    };

    if (config.env === 'development' && err.stack) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

export default globalErrorHandler;
