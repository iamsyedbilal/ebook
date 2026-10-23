import type mongoose from 'mongoose';

export interface Book {
    _id: string;
    title: string;
    slug: string;
    description: string;
    author: string;
    genre: string;
    coverImage: string;
    file: string;
    price: number;
    createdBy:
        | mongoose.Types.ObjectId
        | { _id: string; name: string; email: string };
    createdAt?: Date;
    updatedAt?: Date;
}
