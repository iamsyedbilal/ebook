import type { Request, Response } from 'express';
import createHttpError from 'http-errors';
import asyncHandler from '../../utils/asyncHandler.js';
import * as bookService from './book.service.js';
import type { BookFiles } from './book.types.js';

type UploadedFields = {
    coverImage?: Express.Multer.File[];
    file?: Express.Multer.File[];
};

const getUploadedFiles = (req: Request): BookFiles => {
    const files = req.files as UploadedFields | undefined;

    return {
        ...(files?.coverImage?.[0] ? { coverImage: files.coverImage[0] } : {}),
        ...(files?.file?.[0] ? { file: files.file[0] } : {}),
    };
};

const parsePage = (value: unknown, fallback: number): number => {
    if (value === undefined) return fallback;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
        throw createHttpError(
            400,
            'Pagination values must be positive integers.',
        );
    }
    return parsed;
};

export const getAllBooks = asyncHandler(async (req: Request, res: Response) => {
    const page = parsePage(req.query.page, 1);
    const limit = Math.min(parsePage(req.query.limit, 10), 100);
    const result = await bookService.listBooks(page, limit);
    res.status(200).json(result);
});

export const getBookBySlug = asyncHandler(
    async (req: Request, res: Response) => {
        const slug = req.params.slug;
        if (typeof slug !== 'string' || !slug) {
            throw createHttpError(400, 'A book slug is required.');
        }

        const book = await bookService.getBookBySlug(slug);
        res.status(200).json(book);
    },
);

export const createBook = asyncHandler(async (req: Request, res: Response) => {
    const book = await bookService.createBook(
        req.body ?? {},
        getUploadedFiles(req),
        req.user!._id,
    );

    res.status(201).json({
        message: 'Book created successfully.',
        book,
    });
});

export const updateBook = asyncHandler(async (req: Request, res: Response) => {
    const slug = req.params.slug;
    if (typeof slug !== 'string' || !slug) {
        throw createHttpError(400, 'A book slug is required.');
    }

    const book = await bookService.updateBook(
        slug,
        req.body ?? {},
        getUploadedFiles(req),
    );

    res.status(200).json({
        message: 'Book updated successfully.',
        book,
    });
});

export const deleteBook = asyncHandler(async (req: Request, res: Response) => {
    const slug = req.params.slug;
    if (typeof slug !== 'string' || !slug) {
        throw createHttpError(400, 'A book slug is required.');
    }

    await bookService.deleteBook(slug);
    res.status(200).json({
        message: 'Book and its associated files deleted successfully.',
    });
});
