import express from 'express';
import {
    getAllBooks,
    getBookBySlug,
    createBook,
    updateBook,
    deleteBook,
} from './bookController.js';
const bookRouter = express.Router();
import verifyJWT from '../middlewares/verifyJWT.js';
import isAdmin from '../middlewares/isAdmin.js';

bookRouter.get('/', getAllBooks);

bookRouter.get('/:slug', verifyJWT, getBookBySlug);

bookRouter.post('/', verifyJWT, isAdmin('admin'), createBook);

bookRouter.patch('/:slug', verifyJWT, isAdmin('admin'), updateBook);

bookRouter.delete('/:slug', verifyJWT, isAdmin('admin'), deleteBook);

export default bookRouter;
