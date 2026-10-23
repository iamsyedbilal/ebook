import type { NextFunction, Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import bookModel from './bookModel.js';
import createHttpError from 'http-errors';

/*
    GET ALL BOOKS
*/
const getAllBooks = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        // Pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const totalBooks = await bookModel.countDocuments();

        const totalPages = Math.ceil(totalBooks / limit);

        const books = await bookModel.find().skip(skip).limit(limit);

        if (books.length === 0) {
            return next(
                createHttpError(
                    404,
                    'No books found. Please check back later or try a different query.',
                ),
            );
        }

        res.status(200).json({
            books,
            totalBooks,
            totalPages,
            currentPage: page,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        });
    },
);

/*
    GET BOOK BY SLUG
*/
const getBookBySlug = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { slug } = req.params;

        if (typeof slug !== 'string') {
            return next(
                createHttpError(
                    404,
                    'Book not found. Please check the slug and try again.',
                ),
            );
        }

        const book = await bookModel.findOne({ slug });

        if (!book) {
            return next(
                createHttpError(
                    404,
                    'Book not found. Please check the slug and try again.',
                ),
            );
        }

        res.status(200).json(book);
    },
);

/*
    CREATE BOOK
*/
const createBook = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {},
);

/*
    UPDATE BOOK
*/
const updateBook = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {},
);

/*
    DELETE BOOK
*/
const deleteBook = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {},
);

export { getAllBooks, getBookBySlug, createBook, updateBook, deleteBook };
