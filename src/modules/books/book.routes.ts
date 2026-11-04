import { Router } from 'express';
import {
    createBook,
    deleteBook,
    getAllBooks,
    getBookBySlug,
    updateBook,
} from './book.controller.js';
import verifyJWT from '../../middlewares/verifyJWT.js';
import isAdmin from '../../middlewares/isAdmin.js';
import { upload } from '../../middlewares/upload.js';

const bookRouter = Router();

bookRouter.get('/', getAllBooks);
bookRouter.get('/:slug', verifyJWT, getBookBySlug);

bookRouter.post(
    '/',
    verifyJWT,
    isAdmin('admin'),
    upload.fields([
        { name: 'coverImage', maxCount: 1 },
        { name: 'file', maxCount: 1 },
    ]),
    createBook,
);

bookRouter.patch(
    '/:slug',
    verifyJWT,
    isAdmin('admin'),
    upload.fields([
        { name: 'coverImage', maxCount: 1 },
        { name: 'file', maxCount: 1 },
    ]),
    updateBook,
);

bookRouter.delete('/:slug', verifyJWT, isAdmin('admin'), deleteBook);

export default bookRouter;
