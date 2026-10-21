import express, {
    type NextFunction,
    type Request,
    type Response,
} from 'express';
import globalErrorHandler from './middlewares/globalErrorHandler.js';

const app = express();

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static('public'));

// Routes

// Http methods GET,POST,PUT,PATCH,DELETE
app.get('/', function (req: Request, res: Response, next: NextFunction) {
    res.json({ message: 'Welcome to ebook api' });
});

app.use('/api/v1/users', (await import('./user/userRouter.js')).default);

// global error handler
app.use(globalErrorHandler);

export default app;
