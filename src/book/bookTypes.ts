import type { Types } from 'mongoose';

export interface BookAsset {
    url: string;
    publicId: string;
}

export interface Book {
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
