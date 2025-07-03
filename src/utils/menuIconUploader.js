import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MenuIconUploader {
    constructor() {
        this.config = {
            maxFileSize: 100 * 1024,
            uploadPath: path.join(__dirname, '../../public/uploads/icons'),
            allowedMimeTypes: ['image/svg+xml']
        };

        // Ensure the upload directory exists
        fs.mkdirSync(this.config.uploadPath, { recursive: true });

        this.storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, this.config.uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
                const safeFileName = this.sanitizeFileName(file.originalname);
                cb(null, `${path.parse(safeFileName).name}-${uniqueSuffix}.svg`);
            }
        });

        this.fileFilter = (req, file, cb) => {
            if (this.config.allowedMimeTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Only SVG files are allowed'), false);
            }
        };

        this.multerInstance = multer({
            storage: this.storage,
            fileFilter: this.fileFilter,
            limits: {
                fileSize: this.config.maxFileSize // Enforce 100KB limit
            }
        });
    }

    sanitizeFileName(filename) {
        return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    }

    handleMenuIconUpload() {
        return this.multerInstance.single('menu_icon');
    }

    errorHandler() {
        return (error, req, res, next) => {
            if (error instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: 'Icon upload error',
                    error: error.message
                });
            }
            
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            
            next();
        };
    }
}

const menuIconUploader = new MenuIconUploader();
export default menuIconUploader;