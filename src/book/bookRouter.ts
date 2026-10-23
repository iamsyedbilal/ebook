import express from 'express';
import {
    getAllBooks,
    getBookBySlug,
    createBook,
    updateBook,
    deleteBook,
} from './bookController.js';
const bookRouter = express.Router();

bookRouter.get('/', getAllBooks);

bookRouter.get('/:slug', getBookBySlug);

bookRouter.post('/', createBook);

bookRouter.patch('/:slug', updateBook);

bookRouter.delete('/:slug', deleteBook);

export default bookRouter;
