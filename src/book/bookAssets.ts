import createHttpError from 'http-errors';

import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from '../config/cloudinary.js';

interface UploadedAsset {
    url: string;
    publicId: string;
}

interface ProcessedBookFiles {
    coverImage?: UploadedAsset;
    file?: UploadedAsset;
}

interface BookFiles {
    coverImage?: Express.Multer.File;
    file?: Express.Multer.File;
}

export const processBookFiles = async (
    files: BookFiles,
    isUpdate = false,
): Promise<ProcessedBookFiles> => {
    const { coverImage, file } = files;

    if (!isUpdate && (!coverImage || !file)) {
        throw createHttpError(
            400,
            'Both cover image and PDF file are required.',
        );
    }

    const result: ProcessedBookFiles = {};

    try {
        if (coverImage) {
            const uploaded = await uploadOnCloudinary(coverImage.path, 'image');

            if (!uploaded) {
                throw createHttpError(500, 'Cover image upload failed.');
            }

            result.coverImage = {
                url: uploaded.secure_url,
                publicId: uploaded.public_id,
            };
        }

        if (file) {
            const uploaded = await uploadOnCloudinary(file.path, 'raw');

            if (!uploaded) {
                throw createHttpError(500, 'PDF file upload failed.');
            }

            result.file = {
                url: uploaded.secure_url,
                publicId: uploaded.public_id,
            };
        }

        return result;
    } catch (error) {
        // Roll back any successful uploads.
        const cleanupTasks: Promise<unknown>[] = [];

        if (result.coverImage) {
            cleanupTasks.push(
                deleteFromCloudinary(result.coverImage.publicId, 'image'),
            );
        }

        if (result.file) {
            cleanupTasks.push(
                deleteFromCloudinary(result.file.publicId, 'raw'),
            );
        }

        await Promise.allSettled(cleanupTasks);

        throw error;
    }
};

export const deleteBookAssets = async (assets: ProcessedBookFiles) => {
    const cleanupTasks: Promise<unknown>[] = [];

    if (assets.coverImage) {
        cleanupTasks.push(
            deleteFromCloudinary(assets.coverImage.publicId, 'image'),
        );
    }

    if (assets.file) {
        cleanupTasks.push(deleteFromCloudinary(assets.file.publicId, 'raw'));
    }

    const results = await Promise.allSettled(cleanupTasks);

    results.forEach((result) => {
        if (result.status === 'rejected') {
            console.error('Cloudinary cleanup failed:', result.reason);
        }
    });
};
