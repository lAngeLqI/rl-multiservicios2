// src/config/multer.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear carpeta uploads si no existe
const uploadDir = process.env['UPLOAD_DIR'] || './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (_req: any, file: any, cb: any) => {
    // 🔥 FORMATOS PERMITIDOS (TIFF, PSD, AI, PDF, PNG, JPG, etc.)
    const allowedTypes = [
        'image/tiff', 'image/tif',
        'image/jpeg', 'image/png',
        'application/pdf',
        'application/postscript',
        'image/vnd.adobe.photoshop',
        'text/plain'
    ];
    
    const allowedExtensions = ['.tiff', '.tif', '.jpg', '.jpeg', '.png', '.pdf', '.psd', '.ai', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Formato no soportado: ${file.originalname}`), false);
    }
};

// 🔥 TAMAÑO MÁXIMO: 500MB (usando el valor de .env o por defecto)
const maxSize = Number(process.env['MAX_FILE_SIZE']) || 500 * 1024 * 1024;

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: maxSize
    }
});

export const uploadMultiple = upload.array('archivos', 20);