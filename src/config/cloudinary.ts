import { v2 as cloudinary } from 'cloudinary';
import { config } from './config.js';
import fs from 'node:fs';

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

// Upload an image
export const uploadOnCloudinary = async (filePath: string) => {
    try {
        if (!filePath) return null;
        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: 'auto',
        });
        fs.unlinkSync(filePath); // Delete the local file after upload
        return response; // Return the secure URL of the uploaded image
    } catch (error) {
        fs.unlinkSync(filePath); // Delete the local file in case of an error
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};
