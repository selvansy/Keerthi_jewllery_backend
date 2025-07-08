// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// class UploadConfig {
//     constructor(config = {}) {
//         this.config = {
//             maxFileSize: config.maxFileSize || 10 * 1024 * 1024,
//             uploadPath: config.uploadPath || '../public/uploads',
//             allowedMimeTypes: config.allowedMimeTypes || [
//                 'image/jpeg',
//                 'image/png',
//                 'image/webp',
//                 'application/pdf',
//                 'application/msword',
//                 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//                 'application/vnd.ms-excel',
//                 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//                 'text/plain',
//                 'text/csv',
//                 'application/csv',
//                 'application/zip',
//                 'application/x-zip-compressed'
//             ]
//         };

//         this.storage = multer.diskStorage({
//             destination: (req, file, cb) => {
//                 const uploadDirectory = path.join(__dirname, this.config.uploadPath);
//                 const fileType = this.getFileType(file.mimetype);
//                 const typeDirectory = path.join(uploadDirectory, fileType);
                
//                 fs.mkdirSync(typeDirectory, { recursive: true });
//                 cb(null, typeDirectory);
//             },
//             filename: (req, file, cb) => {
//                 const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
//                 const safeFileName = this.sanitizeFileName(file.originalname);
//                 cb(null, `${path.parse(safeFileName).name}-${uniqueSuffix}${path.extname(file.originalname)}`);
//             }
//         });

//         this.fileFilter = (req, file, cb) => {
//             if (this.config.allowedMimeTypes.includes(file.mimetype)) {
//                 cb(null, true);
//             } else {
//                 cb(new Error(`Invalid file type. Allowed types are: ${this.config.allowedMimeTypes.join(', ')}`), false);
//             }
//         };

//         this.multerInstance = multer({
//             storage: this.storage,
//             fileFilter: this.fileFilter,
//             limits: {
//                 fileSize: this.config.maxFileSize
//             }
//         });
//     }

//     // Helper method to sanitize filenames
//     sanitizeFileName(filename) {
//         return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
//     }

//     // Helper method to categorize files
//     getFileType(mimetype) {
//         const typeMap = {
//             'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
//             'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
//             'spreadsheet': ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
//             'text': ['text/plain', 'text/csv', 'application/csv'],
//             'archive': ['application/zip', 'application/x-zip-compressed']
//         };

//         for (const [type, mimeTypes] of Object.entries(typeMap)) {
//             if (mimeTypes.includes(mimetype)) return type;
//         }
//         return 'other';
//     }

//     // Method to handle dynamic fields
//     handleUpload(fields = null) {
        
//         if (!fields) {
//             return this.multerInstance.any();
//         }

//         if (Array.isArray(fields)) {
//             return this.multerInstance.fields(fields);
//         }

//         if (typeof fields === 'string') {
//             return this.multerInstance.single(fields);
//         }

//         if (typeof fields === 'object' && fields.fieldName) {
//             return this.multerInstance.array(fields.fieldName, fields.maxCount);
//         }
        
//         throw new Error('Invalid fields configuration');
//     }

//     errorHandler() {
//         return (error, req, res, next) => {
//             if (error instanceof multer.MulterError) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'File upload error',
//                     error: error.message
//                 });
//             }
            
//             if (error) {
//                 return res.status(400).json({
//                     success: false,
//                     message: error.message
//                 });
//             }
            
//             next();
//         };
//     }

//     unlinkFile(filePath) {
//         return new Promise((resolve, reject) => {
//             const fullPath = path.join(__dirname, this.config.uploadPath, filePath);

//             fs.unlink(fullPath, (err) => {
//                 if (err) {
//                     console.error(`Failed to delete file: ${fullPath}`, err);
//                     reject(new Error('Failed to delete file.'));
//                 } else {
//                     console.info(`File deleted: ${fullPath}`);
//                     resolve(true);
//                 }
//             });
//         });
//     }
// }


// const defaultUploader = new UploadConfig();

// export const upload = defaultUploader;

// export const createUploader = (config) => new UploadConfig(config);

import multer from 'multer';

class UploadConfig {
    constructor(config = {}) {
        this.config = {
            maxFileSize: config.maxFileSize || 10 * 1024 * 1024,
            allowedMimeTypes: config.allowedMimeTypes || [
                'image/jpeg',
                'image/png',
                'image/webp',
                'image/svg+xml',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain',
                'text/csv',
                'application/csv',
                'application/zip',
                'application/x-zip-compressed',
                'application/octet-stream'
            ]
        };

        this.storage = multer.memoryStorage();

        this.fileFilter = (req, file, cb) => {
            if (this.config.allowedMimeTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error(`Invalid file type. Allowed types are: ${this.config.allowedMimeTypes.join(', ')}`), false);
            }
        };

        this.multerInstance = multer({
            storage: this.storage,
            fileFilter: this.fileFilter,
            limits: {
                fileSize: this.config.maxFileSize
            }
        });
    }

    handleUpload(fields = null) {
        if (!fields) {
            return this.multerInstance.any();
        }

        if (Array.isArray(fields)) {
            return this.multerInstance.fields(fields);
        }

        if (typeof fields === 'string') {
            return this.multerInstance.single(fields);
        }

        if (typeof fields === 'object' && fields.fieldName) {
            return this.multerInstance.array(fields.fieldName, fields.maxCount);
        }

        throw new Error('Invalid fields configuration');
    }

    errorHandler() {
        return (error, req, res, next) => {
            if (error instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: 'File upload error',
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

const defaultUploader = new UploadConfig();

export const upload = defaultUploader;

export const createUploader = (config) => new UploadConfig(config);