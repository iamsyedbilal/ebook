import type { NextFunction, Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import bookModel from './bookModel.js';
import createHttpError from 'http-errors';
import { cloudinaryDestroy, uploadOnCloudinary } from '../config/cloudinary.js';

/*
    GET ALL BOOKS
*/
const getAllBooks = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const requestedPage = Number(req.query.page ?? 1);
        const requestedLimit = Number(req.query.limit ?? 10);

        const page =
            Number.isInteger(requestedPage) && requestedPage > 0
                ? requestedPage
                : 1;

        const limit =
            Number.isInteger(requestedLimit) && requestedLimit > 0
                ? Math.min(requestedLimit, 100)
                : 10;

        const skip = (page - 1) * limit;

        const [books, totalBooks] = await Promise.all([
            bookModel
                .find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            bookModel.countDocuments(),
        ]);

        const totalPages = Math.ceil(totalBooks / limit);

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

        if (typeof slug !== 'string' || !slug.trim()) {
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

// CREATE BOOK
const createBook = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { title, slug, author, genre, description, price } = req.body;

        if (!title || !slug || !author || !genre || !description) {
            return next(
                createHttpError(
                    400,
                    'Missing required fields: title, slug, author, genre, description.',
                ),
            );
        }

        const files = req.files as
            | { [fieldname: string]: Express.Multer.File[] }
            | undefined;

        const coverImage = files?.coverImage?.[0];
        const pdfFile = files?.file?.[0];

        if (!coverImage) {
            return next(createHttpError(400, 'Cover image is required.'));
        }

        if (!pdfFile) {
            return next(createHttpError(400, 'Book PDF is required.'));
        }

        // Basic MIME-type checks; validate actual file contents too.
        if (!coverImage.mimetype.startsWith('image/')) {
            return next(createHttpError(400, 'Cover must be an image.'));
        }

        if (pdfFile.mimetype !== 'application/pdf') {
            return next(createHttpError(400, 'Book file must be a PDF.'));
        }

        let uploadedCover:
            | Awaited<ReturnType<typeof uploadOnCloudinary>>
            | undefined;

        let uploadedPdf:
            | Awaited<ReturnType<typeof uploadOnCloudinary>>
            | undefined;

        try {
            // Upload cover image
            uploadedCover = await uploadOnCloudinary(
                coverImage.path,
                'books-cover',
                'image',
            );

            // Upload PDF
            uploadedPdf = await uploadOnCloudinary(
                pdfFile.path,
                'books-pdf',
                'raw',
            );

            // Save book details in MongoDB
            const book = await bookModel.create({
                title,
                slug,
                author,
                genre,
                description,
                price,

                coverImage: {
                    url: uploadedCover.secure_url,
                    publicId: uploadedCover.public_id,
                },

                file: {
                    url: uploadedPdf.secure_url,
                    publicId: uploadedPdf.public_id,
                },
                createdBy: req.user._id,
            });

            return res.status(201).json({
                message: 'Book created successfully.',
                book,
            });
        } catch (error) {
            // Prevent orphaned Cloudinary assets if saving fails.
            const cleanupTasks = [];

            if (uploadedCover) {
                cleanupTasks.push(
                    cloudinaryDestroy(uploadedCover.public_id, 'image'),
                );
            }

            if (uploadedPdf) {
                cleanupTasks.push(
                    cloudinaryDestroy(uploadedPdf.public_id, 'raw'),
                );
            }

            await Promise.allSettled(cleanupTasks);

            throw error;
        }
    },
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
