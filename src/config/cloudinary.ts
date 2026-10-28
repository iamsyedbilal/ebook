import { v2 as cloudinary } from 'cloudinary';
import { config } from './config.js';
import fs from 'node:fs/promises';
import path from 'node:path';

// Configuration
const { cloudName, apiKey, apiSecret } = config.cloudinary;

if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are not configured.');
}

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
});

type UploadResourceType = 'image' | 'raw';

// Upload an image
export const uploadOnCloudinary = async (
    filePath: string,
    folder: string,
    resourceType: UploadResourceType,
) => {
    try {
        return await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: resourceType,
            ...(resourceType === 'raw'
                ? { public_id: path.basename(filePath) }
                : {}),
        });
    } finally {
        await fs.unlink(filePath).catch((error: NodeJS.ErrnoException) => {
            if (error.code !== 'ENOENT') {
                console.error('Temporary file cleanup failed:', error);
            }
        });
    }
};

export const cloudinaryDestroy = async (
    publicId: string,
    resourceType: 'image' | 'raw',
) => {
    return cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
    });
};
