import express, {
    type NextFunction,
    type Request,
    type Response,
} from 'express';

const app = express();

// Routes

// Http methods GET,POST,PUT,PATCH,DELETE
app.get('/', function (req: Request, res: Response, next: NextFunction) {
    res.json({ message: 'Welcome to ebook api' });
});

export default app;
