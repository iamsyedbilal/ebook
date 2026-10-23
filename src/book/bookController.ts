import type { NextFunction, Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import bookModel from './bookModel.js';

/*
    GET ALL BOOKS
*/

const getAllBooks = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {},
);

/*
    GET BOOK BY SLUG
*/
const getBookBySlug = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {},
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
