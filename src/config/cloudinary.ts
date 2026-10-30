import { v2 as cloudinary } from 'cloudinary';
import { config } from './config.js';
import fs from 'fs';

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

export type ResourceType = 'image' | 'raw';

/**
 * Uploads a local file (Image, PDF, etc.) to Cloudinary
 * @param {string} localFilePath - The temporary local path of the file (e.g., from Multer)
 * @returns {object|null} - The Cloudinary response object or null if failed
 */
export const uploadOnCloudinary = async (
    localFilePath: string,
    resourceType: ResourceType,
) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            folder: 'books_assets',
            resource_type: resourceType,
        });

        // SUCCESS: Remove the local temporary file from public/data/upload
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        console.error('Cloudinary upload failed:', error);
        return null;
    }
};

/**
 * Deletes a file from Cloudinary using its public ID
 * @param {string} publicId - The unique Cloudinary public ID of the asset
 * @param {string} [resourceType="image"] - The type of resource ('image', 'raw', 'video')
 * @returns {object|null} - The Cloudinary response object or null if failed
 */
export const deleteFromCloudinary = async (
    publicId: string,
    resourceType: ResourceType,
) => {
    try {
        if (!publicId) return null;

        // Delete the asset from Cloudinary
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });

        return response;
    } catch (error) {
        console.error('Cloudinary deletion failed:', error);
        return null;
    }
};
