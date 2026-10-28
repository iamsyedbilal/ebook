import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';

const uploadDir = path.resolve(process.cwd(), 'public/data/uploads');

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, uploadDir);
    },
    filename: (_req, file, callback) => {
        const uniqueName =
            `${Date.now()}-${randomUUID()}` +
            path.extname(file.originalname).toLowerCase();

        callback(null, uniqueName);
    },
});

export const uploadBookFiles = multer({
    storage,
    limits: {
        files: 2,
        fileSize: 20 * 1024 * 1024,
    },
    fileFilter: (_req, file, callback) => {
        const isCover = file.fieldname === 'coverImage';
        const isPdf = file.fieldname === 'file';

        if (
            isCover &&
            ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)
        ) {
            return callback(null, true);
        }

        if (isPdf && file.mimetype === 'application/pdf') {
            return callback(null, true);
        }

        callback(new Error('Invalid file type for the requested field.'));
    },
}).fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'file', maxCount: 1 },
]);
