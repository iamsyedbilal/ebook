import type { Types } from 'mongoose';

export interface BookAsset {
    url: string;
    publicId: string;
}

export interface Book {
    _id: Types.ObjectId;
    title: string;
    slug: string;
    author: string;
    genre: string;
    description: string;
    coverImage: BookAsset;
    file: BookAsset;
    price: number;
    createdBy: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface BookFiles {
    coverImage?: Express.Multer.File;
    file?: Express.Multer.File;
}

export interface BookInput {
    title: string;
    author: string;
    genre: string;
    description: string;
    price?: number;
}
