import express, { type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './modules/auth/auth.routes.js';
import bookRouter from './modules/books/book.routes.js';
import globalErrorHandler from './middlewares/globalErrorHandler.js';

const app = express();

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Health check
app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the ebook API.',
    });
});

// API routes
app.use('/api/v1/users', authRouter);
app.use('/api/v1/books', bookRouter);

// Keep the error handler after all routes and middleware.
app.use(globalErrorHandler);

export default app;
