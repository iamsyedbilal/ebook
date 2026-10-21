import express, {
    type NextFunction,
    type Request,
    type Response,
} from 'express';
import globalErrorHandler from './middlewares/globalErrorHandler.js';

const app = express();

// Routes

// Http methods GET,POST,PUT,PATCH,DELETE
app.get('/', function (req: Request, res: Response, next: NextFunction) {
    res.json({ message: 'Welcome to ebook api' });
});

// global error handler
app.use(globalErrorHandler);

export default app;
