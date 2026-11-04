import createHttpError from 'http-errors';
import slugify from 'slugify';
import type { Types } from 'mongoose';
import BookModel from './book.model.js';
import type { Book, BookFiles } from './book.types.js';
import { deleteBookAssets, uploadBookAssets } from './book-assets.service.js';

type BookUpdateInput = Partial<Pick<Book, 'title' | 'author' | 'genre' | 'description' | 'price'>>;

const buildSlug = (title: string): string =>
    slugify(title, { lower: true, strict: true, trim: true });

const normalizeText = (value: unknown, field: string): string => {
    if (typeof value !== 'string' || !value.trim()) {
        throw createHttpError(400, `${field} must be a non-empty string.`);
    }
    return value.trim();
};

const buildUpdateData = async (
    book: Book,
    input: BookUpdateInput,
): Promise<Partial<Book>> => {
    const update: Partial<Book> = {};

    if (input.title !== undefined) {
        const title = normalizeText(input.title, 'Title');
        update.title = title;

        if (title !== book.title) {
            const slug = buildSlug(title);
            const duplicate = await BookModel.exists({
                slug,
                _id: { $ne: book._id },
            });

            if (duplicate) {
                throw createHttpError(409, 'A book with this title already exists.');
            }
            update.slug = slug;
        }
    }

    if (input.author !== undefined) update.author = normalizeText(input.author, 'Author');
    if (input.genre !== undefined) update.genre = normalizeText(input.genre, 'Genre');
    if (input.description !== undefined) {
        update.description = normalizeText(input.description, 'Description');
    }

    if (input.price !== undefined) {
        const price = Number(input.price);
        if (!Number.isFinite(price) || price < 0) {
            throw createHttpError(400, 'Price must be a valid non-negative number.');
        }
        update.price = price;
    }

    return update;
};

export const listBooks = async (page: number, limit: number) => {
    const [books, totalBooks] = await Promise.all([
        BookModel.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit),
        BookModel.countDocuments(),
    ]);

    return {
        books,
        totalBooks,
        totalPages: Math.ceil(totalBooks / limit),
        currentPage: page,
    };
};

export const getBookBySlug = async (slug: string) => {
    const book = await BookModel.findOne({ slug });
    if (!book) throw createHttpError(404, 'Book not found.');
    return book;
};

export const createBook = async (
    input: BookUpdateInput,
    files: BookFiles,
    createdBy: Types.ObjectId,
) => {
    const title = normalizeText(input.title, 'Title');
    const slug = buildSlug(title);

    if (!slug) throw createHttpError(400, 'Title cannot produce a valid URL slug.');

    const duplicate = await BookModel.exists({ slug });
    if (duplicate) throw createHttpError(409, 'A book with this title already exists.');

    const author = normalizeText(input.author, 'Author');
    const genre = normalizeText(input.genre, 'Genre');
    const description = normalizeText(input.description, 'Description');
    const price = input.price === undefined ? 0 : Number(input.price);

    if (!Number.isFinite(price) || price < 0) {
        throw createHttpError(400, 'Price must be a valid non-negative number.');
    }

    const assets = await uploadBookAssets(files, true);

    try {
        return await BookModel.create({
            title,
            slug,
            author,
            genre,
            description,
            price,
            coverImage: assets.coverImage,
            file: assets.file,
            createdBy,
        });
    } catch (error) {
        await deleteBookAssets(assets);
        throw error;
    }
};

export const updateBook = async (
    slug: string,
    input: BookUpdateInput,
    files: BookFiles,
) => {
    const book = await BookModel.findOne({ slug });
    if (!book) throw createHttpError(404, 'Book not found.');

    const update = await buildUpdateData(book, input);
    const newAssets = await uploadBookAssets(files);

    if (newAssets.coverImage) update.coverImage = newAssets.coverImage;
    if (newAssets.file) update.file = newAssets.file;

    if (Object.keys(update).length === 0) {
        return book;
    }

    let updatedBook: Book | null;

    try {
        updatedBook = await BookModel.findByIdAndUpdate(
            book._id,
            { $set: update },
            { new: true, runValidators: true },
        );
    } catch (error) {
        await deleteBookAssets(newAssets);
        throw error;
    }

    if (!updatedBook) {
        await deleteBookAssets(newAssets);
        throw createHttpError(404, 'Book no longer exists.');
    }

    const replacedAssets = {
        ...(newAssets.coverImage ? { coverImage: book.coverImage } : {}),
        ...(newAssets.file ? { file: book.file } : {}),
    };
    await deleteBookAssets(replacedAssets);

    return updatedBook;
};

export const deleteBook = async (slug: string) => {
    const book = await BookModel.findOneAndDelete({ slug });
    if (!book) throw createHttpError(404, 'Book not found.');

    // Database deletion is authoritative; failed remote cleanup is logged for later repair.
    await deleteBookAssets({
        coverImage: book.coverImage,
        file: book.file,
    });
};
