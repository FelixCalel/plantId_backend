import multer from 'multer';
import path from 'path';

export const upload = multer({
    storage: multer.diskStorage({
        destination: 'uploads/',
        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, `${Date.now()}${ext}`);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});
