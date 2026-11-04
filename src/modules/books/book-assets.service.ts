import createHttpError from 'http-errors';
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from '../../config/cloudinary.js';
import type { BookAsset, BookFiles } from './book.types.js';

export interface UploadedBookAssets {
    coverImage?: BookAsset;
    file?: BookAsset;
}

export const uploadBookAssets = async (
    files: BookFiles,
    requireBoth = false,
): Promise<UploadedBookAssets> => {
    if (requireBoth && (!files.coverImage || !files.file)) {
        throw createHttpError(400, 'Both cover image and PDF file are required.');
    }

    const uploadedAssets: UploadedBookAssets = {};

    try {
        if (files.coverImage) {
            const result = await uploadOnCloudinary(files.coverImage.path, 'image');
            if (!result) throw createHttpError(502, 'Cover image upload failed.');

            uploadedAssets.coverImage = {
                url: result.secure_url,
                publicId: result.public_id,
            };
        }

        if (files.file) {
            const result = await uploadOnCloudinary(files.file.path, 'raw');
            if (!result) throw createHttpError(502, 'PDF upload failed.');

            uploadedAssets.file = {
                url: result.secure_url,
                publicId: result.public_id,
            };
        }

        return uploadedAssets;
    } catch (error) {
        await deleteBookAssets(uploadedAssets);
        throw error;
    }
};

export const deleteBookAssets = async (assets: UploadedBookAssets): Promise<void> => {
    const tasks: Promise<unknown>[] = [];

    if (assets.coverImage) {
        tasks.push(deleteFromCloudinary(assets.coverImage.publicId, 'image'));
    }

    if (assets.file) {
        tasks.push(deleteFromCloudinary(assets.file.publicId, 'raw'));
    }

    const results = await Promise.allSettled(tasks);
    for (const result of results) {
        if (result.status === 'rejected') {
            // Cleanup failures should be observable without hiding the original operation.
            console.error('Cloudinary asset cleanup failed:', result.reason);
        }
    }
};
