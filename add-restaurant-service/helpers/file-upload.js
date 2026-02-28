import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const createUploadDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const storage = (uploadPath) => multer.diskStorage({
    destination: (req, file, cb) => {
        createUploadDir(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, JPG, PNG, WEBP)'), false);
    }
};

export const uploadRestaurantPhoto = multer({
    storage: storage('uploads/restaurants'),
    limits: { fileSize: MAX_SIZE },
    fileFilter
});

export const uploadMenuPhoto = multer({
    storage: storage('uploads/menu'),
    limits: { fileSize: MAX_SIZE },
    fileFilter
});

export const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'El archivo es demasiado grande',
                error: `El tamaño máximo permitido es ${MAX_SIZE / (1024 * 1024)}MB`
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Campo de archivo inesperado',
                error: error.message
            });
        }
    }

    if (error?.message?.includes('Tipo de archivo no permitido')) {
        return res.status(400).json({
            success: false,
            message: 'Tipo de archivo no permitido',
            error: 'Solo se permiten imágenes (JPEG, JPG, PNG, WEBP)'
        });
    }

    next(error);
};
