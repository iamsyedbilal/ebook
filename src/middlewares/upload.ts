import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const destination = path.resolve(currentDirectory, '../../public/data/uploads');

if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, destination);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

        const fileExt = path.extname(file.originalname);

        cb(null, `${file.fieldname}-${uniqueSuffix}${fileExt}`);
    },
});

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 30 * 1024 * 1024, // 30 MB security limit
    },
});
