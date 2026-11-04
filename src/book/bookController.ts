import type { NextFunction, Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import bookModel from './bookModel.js';
import createHttpError from 'http-errors';
import slugify from 'slugify'; // Assuming you use slugify for generating slugs
import { processBookFiles } from './bookAssets.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';
import type { Book } from './bookTypes.js';

/*
    GET ALL BOOKS
*/
const getAllBooks = asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

    const [books, totalBooks] = await Promise.all([
        bookModel
            .find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit),
        bookModel.countDocuments(),
    ]);

    res.status(200).json({
        books,
        totalBooks,
        totalPages: Math.ceil(totalBooks / limit),
        currentPage: page,
    });
});

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
        const { title, author, genre, description, price } = req.body;

        if (!title || !author || !genre || !description) {
            return next(createHttpError(400, 'All text fields are required.'));
        }

        // Generate a clean slug
        const slug = slugify.default(title, { lower: true, strict: true });

        const existingBook = await bookModel.findOne({ slug });

        if (existingBook) {
            return next(
                createHttpError(
                    400,
                    'A book with a similar title already exists.',
                ),
            );
        }

        // Use the custom file orchestrator service
        const multerFiles = req.files as
            | { [fieldname: string]: Express.Multer.File[] }
            | undefined;

        const uploadedAssets = await processBookFiles({
            ...(multerFiles?.coverImage?.[0] && {
                coverImage: multerFiles.coverImage[0],
            }),
            ...(multerFiles?.file?.[0] && {
                file: multerFiles.file[0],
            }),
        });

        if (!uploadedAssets.coverImage || !uploadedAssets.file) {
            throw createHttpError(500, 'Book files could not be uploaded.');
        }

        // Save to Database
        const newBook = await bookModel.create({
            title,
            slug,
            author,
            genre,
            description,
            price: price || 0,
            coverImage: uploadedAssets.coverImage,
            file: uploadedAssets.file,
            createdBy: req.user?._id,
        });

        res.status(201).json({
            message: 'Book created successfully!',
            book: newBook,
        });
    },
);

/*
    UPDATE BOOK
*/
const updateBook = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const slug = req.params.slug;

        if (typeof slug !== 'string' || !slug.trim()) {
            return next(createHttpError(400, 'Invalid book slug.'));
        }

        const { title, author, genre, description, price } = req.body;

        const book = await bookModel.findOne({ slug });

        if (!book) {
            return next(createHttpError(404, 'Book not found.'));
        }

        const updateData: Partial<Book> = {};

        // If the title changes, compile a brand new slug
        if (title && title !== book.title) {
            const newSlug = slugify.default(title.trim(), {
                lower: true,
                strict: true,
            });

            const existingBook = await bookModel.findOne({
                slug: newSlug,
                _id: { $ne: book._id },
            });

            if (existingBook) {
                return next(
                    createHttpError(409, 'This book title already exists.'),
                );
            }

            updateData.slug = newSlug;
        }

        if (author !== undefined) {
            if (typeof author !== 'string' || !author.trim()) {
                return next(createHttpError(400, 'Invalid author.'));
            }

            updateData.author = author.trim();
        }

        if (genre !== undefined) {
            if (typeof genre !== 'string' || !genre.trim()) {
                return next(createHttpError(400, 'Invalid genre.'));
            }

            updateData.genre = genre.trim();
        }

        if (description !== undefined) {
            if (typeof description !== 'string' || !description.trim()) {
                return next(createHttpError(400, 'Invalid description.'));
            }

            updateData.description = description.trim();
        }

        if (price !== undefined) {
            const bookPrice = Number(price);

            if (!Number.isFinite(bookPrice) || bookPrice < 0) {
                return next(createHttpError(400, 'Invalid book price.'));
            }

            updateData.price = bookPrice;
        }

        const multerFiles = req.files as
            | { [fieldname: string]: Express.Multer.File[] }
            | undefined;

        const uploadedAssets = await processBookFiles(
            {
                coverImage: multerFiles?.coverImage?.[0],
                file: multerFiles?.file?.[0],
            },
            true,
        );

        // If a new cover image came in, save it and scrub old one out from Cloudinary
        if (uploadedAssets.coverImage) {
            await deleteFromCloudinary(book.coverImage.publicId, 'image');
            updateData.coverImage = uploadedAssets.coverImage;
        }

        // If a new PDF file came in, save it and scrub old one out from Cloudinary
        if (uploadedAssets.file) {
            await deleteFromCloudinary(book.file.publicId, 'raw'); // "image" or "raw" depending on setup
            updateData.file = uploadedAssets.file;
        }

        const updatedBook = await bookModel.findOneAndUpdate(
            { slug },
            { $set: updateData },
            { new: true, runValidators: true },
        );

        res.status(200).json({
            message: 'Book updated successfully!',
            book: updatedBook,
        });
    },
);

/*
    DELETE BOOK
*/
const deleteBook = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const slug = req.params.slug;

        if (typeof slug !== 'string' || !slug.trim()) {
            return next(createHttpError(400, 'Invalid book slug.'));
        }

        const book = await bookModel.findOne({ slug });
        if (!book) {
            return next(createHttpError(404, 'Book not found.'));
        }

        // Clean out Cloudinary storage assets immediately
        await deleteFromCloudinary(book.coverImage.publicId, 'image');
        await deleteFromCloudinary(book.file.publicId, 'image');

        // Delete from database
        await bookModel.deleteOne({ slug });

        res.status(200).json({
            message: 'Book and its associated files deleted successfully.',
        });
    },
);

export { getAllBooks, getBookBySlug, createBook, updateBook, deleteBook };
