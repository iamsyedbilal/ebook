import multer, { type FileFilterCallback } from 'multer';
import type { Request } from 'express';
import path from 'node:path';
import fs from 'node:fs';

// Ensure the local directory exists before saving files
const uploadDir = './public/data/uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void,
    ) {
        cb(null, uploadDir);
    },
    filename: function (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void,
    ) {
        // Create a unique filename to prevent overwriting files with identical names
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname +
                '-' +
                uniqueSuffix +
                path.extname(file.originalname),
        );
    },
});

// File Validation Filter
const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
) => {
    // Allowed mime types
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // Accept file
    } else {
        // Reject file with a clear error message
        cb(
            new Error(
                'Invalid file type! Only Images (JPEG, PNG, WEBP) and PDFs are allowed.',
            ),
        );
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // Optional: Limit file size to 5MB
});
