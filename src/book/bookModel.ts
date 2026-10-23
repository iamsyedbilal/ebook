import mongoose from 'mongoose';
import type { Book } from './bookTypes.js';

const bookSchema = new mongoose.Schema<Book>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            index: true,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        author: {
            type: String,
            required: [true, 'Author is required'],
            trim: true,
            index: true,
        },
        genre: {
            type: String,
            required: [true, 'Genre is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },
        coverImage: {
            type: String,
            required: [true, 'Cover image is required'],
        },
        file: {
            type: String,
            required: [true, 'File is required'],
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
            default: 0,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Admin reference is required'],
            index: true,
        },
    },
    {
        timestamps: true,
    },
);

bookSchema.index({
    title: 'text',
    author: 'text',
    genre: 'text',
    description: 'text',
    createdBy: 'text',
});

const bookModel = mongoose.model<Book>('Book', bookSchema);

export default bookModel;
