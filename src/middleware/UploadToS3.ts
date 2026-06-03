import multer, { MulterError } from 'multer';
import axios from 'axios';
import path from 'path';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextFunction, Request, Response } from 'express';
import config from '../DefaultConfig/config';
import globalErrorHandler from '../utils/globalErrorHandler';
// Define types for file fields
interface FileFields {
    img: Express.Multer.File[];
    video: Express.Multer.File[];
    license: Express.Multer.File[];
    prescription: Express.Multer.File[];
    kycFront: Express.Multer.File[];
    kycBack: Express.Multer.File[];
}
// S3 Client Configuration
const s3_client = new S3Client({
    region: 'eu-west-2',
    credentials: {
        accessKeyId: config.ACCESS_KEY,
        secretAccessKey: config.SECRET_KEY,
    },
});

// Function to Get Object URL from S3
const get_object = async (key: string): Promise<string> => {
    const command = new GetObjectCommand({
        Bucket: 'rebecca-uploads',
        Key: key,
    });
    const url = await getSignedUrl(s3_client, command);
    return url;
};

// Function to Upload Object to S3
const put_object = async (
    file_name: string,
    content_type: string,
    buffer: Buffer
): Promise<{ success: boolean; key?: string; signedUrl?: string; path?: string; error?: string }> => {
    try {
        const key = `uploads/${file_name}`;
        const command = new PutObjectCommand({
            Bucket: 'rebecca-uploads',
            Key: key,
            ContentType: content_type,
        });

        const signedUrl = await getSignedUrl(s3_client, command, { expiresIn: 900 });

        await axios.put(signedUrl, buffer, {
            headers: {
                'Content-Type': content_type,
                'Content-Length': buffer.length,
            },
        });

        const publicUrl = await get_object(key);
        return { success: true, key, signedUrl, path: publicUrl };
    } catch (err: any) {
        console.error('Upload failed:', err.message);
        return {
            success: false,
            error: err.message || 'Upload failed',
        };
    }
};

// Upload Middleware
const UploadToS3 = () => {
    const storage = multer.memoryStorage();

    // File Filter for Allowed Fields and Mime Types
    const fileFilter = (req: Request, file: Express.Multer.File,
        cb: multer.FileFilterCallback,) => {
        const allowedFilenames = ['img', 'video', 'license', 'prescription', 'kycFront', 'kycBack'];
        if (!allowedFilenames.includes(file.fieldname)) {
            return cb(new Error(`Invalid field name: ${file.fieldname}`));
        }

        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type: ${file.mimetype}`));
        }
    };

    const upload = multer({
        storage,
        fileFilter,
    }).fields([
        { name: 'img', maxCount: 10 },
        { name: 'video', maxCount: 1 },
        { name: 'license', maxCount: 1 },
        { name: 'prescription', maxCount: 10 },
        { name: 'kycFront', maxCount: 1 },
        { name: 'kycBack', maxCount: 1 },
    ]);

    return (req: Request, res: Response, next: NextFunction) => {
        upload(req, res, async (err: any) => {
            if (err instanceof MulterError) {
                return res.status(400).json({ success: false, message: `Multer error: ${err.message}` });
            } else if (err) {
                return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
            }

            const fileFields: (keyof FileFields)[] = [
                'img',
                'video',
                'license',
                'prescription',
                'kycFront',
                'kycBack',
            ];

            const uploads: Record<string, any> = {};

            try {
                for (const field of fileFields) {
                    if (req.files && (req.files as Record<string, Express.Multer.File[]>)[field]) {
                        uploads[field] = await Promise.all(
                            (req.files as Record<string, Express.Multer.File[]>)[field].map(async (file: Express.Multer.File) => {
                                const result = await put_object(
                                    `${file.fieldname}/${file.originalname}`,
                                    file.mimetype,
                                    file.buffer
                                );
                                return {
                                    originalName: file.originalname,
                                    mimeType: file.mimetype,
                                    size: file.size,
                                    ...result,
                                };
                            })
                        );
                    }
                }
                req.files = uploads
                next();
            } catch (uploadErr) {
                globalErrorHandler(uploadErr, req, res, next);
            }
        });
    };
};

export {
    UploadToS3,
};


// const multer = require('multer');
// const axios = require('axios');
// const path = require('path');
// const {
//     S3Client,
//     GetObjectCommand,
//     PutObjectCommand
// } = require('@aws-sdk/client-s3');
// const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
// const { SECRET_KEY, ACCESS_KEY } = require('../../config/defaults');
// const globalErrorHandler = require('../../utils/globalErrorHandler');

// const s3_client = new S3Client({
//     region: 'eu-west-2',
//     credentials: {
//         accessKeyId: ACCESS_KEY,
//         secretAccessKey: SECRET_KEY,
//     },
// });

// const get_object = async (key) => {
//     const command = new GetObjectCommand({
//         Bucket: 'rebecca-uploads',
//         Key: key,
//     });
//     const url = await getSignedUrl(s3_client, command);
//     return url;
// };

// const put_object = async (file_name, content_type, buffer) => {
//     try {
//         const key = `uploads/${file_name}`;
//         const command = new PutObjectCommand({
//             Bucket: 'rebecca-uploads',
//             Key: key,
//             ContentType: content_type,
//         });

//         const signedUrl = await getSignedUrl(s3_client, command, { expiresIn: 900 });

//         await axios.put(signedUrl, buffer, {
//             headers: {
//                 'Content-Type': content_type,
//                 'Content-Length': buffer.length,
//             },
//         });

//         const publicUrl = await get_object(key);
//         return { success: true, key, signedUrl, path: publicUrl };
//     } catch (err) {
//         console.error('Upload failed:', err.message);
//         return {
//             success: false,
//             error: err.message || 'Upload failed',
//         };
//     }
// };

// // Upload Middleware
// const UploadToS3 = () => {
//     const storage = multer.memoryStorage();

//     const fileFilter = (req, file, cb) => {
//         const allowedFilenames = ['img', 'video', 'license', 'prescription', 'kycFront', 'kycBack'];
//         if (!allowedFilenames.includes(file.fieldname)) {
//             return cb(new Error(`Invalid field name: ${file.fieldname}`));
//         }

//         if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
//             cb(null, true);
//         } else {
//             cb(new Error(`Invalid file type: ${file.mimetype}`));
//         }
//     };

//     const upload = multer({
//         storage,
//         fileFilter,
//     }).fields([
//         { name: 'img', maxCount: 10 },
//         { name: 'video', maxCount: 1 },
//         { name: 'license', maxCount: 1 },
//         { name: 'prescription', maxCount: 10 },
//         { name: 'kycFront', maxCount: 1 },
//         { name: 'kycBack', maxCount: 1 },
//     ]);

//     return (req, res, next) => {
//         upload(req, res, async (err) => {
//             if (err instanceof multer.MulterError) {
//                 return res.status(400).json({ success: false, message: `Multer error: ${err.message}` });
//             } else if (err) {
//                 return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
//             }

//             const fileFields = ['img', 'video', 'license', 'prescription', 'kycFront', 'kycBack'];
//             const uploads = {};

//             try {
//                 for (const field of fileFields) {
//                     if (req.files?.[field]) {
//                         uploads[field] = await Promise.all(
//                             req.files[field].map(async (file) => {
//                                 const result = await put_object(`${file.fieldname}/${file.originalname}`, file.mimetype, file.buffer);
//                                 return {
//                                     originalName: file.originalname,
//                                     mimeType: file.mimetype,
//                                     size: file.size,
//                                     ...result,
//                                 };
//                             })
//                         );
//                     }
//                 }
//                 req.files = uploads;
//                 next();
//             } catch (uploadErr) {
//                 globalErrorHandler(uploadErr, req, res, next);
//             }
//         });
//     };
// };

// module.exports = {
//     UploadToS3,
// };
