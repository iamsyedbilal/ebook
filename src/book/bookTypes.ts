import type mongoose from 'mongoose';

export interface BookAsset {
    url: string;
    publicId: string;
}

export interface Book {
    title: string;
    slug: string;
    description: string;
    author: string;
    genre: string;
    coverImage: BookAsset;
    file: BookAsset;
    price: number;
    createdBy:
        | mongoose.Types.ObjectId
        | { _id: string; name: string; email: string };
    createdAt?: Date;
    updatedAt?: Date;
}
