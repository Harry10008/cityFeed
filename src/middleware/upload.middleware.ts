import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../utils/appError';

// Set storage engine
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/merchants');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Create unique filename: timestamp + original name
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

// Check file type
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only images
  const filetypes = /jpeg|jpg|png|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  
  cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'));
};

// Initialize upload
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter
});

// Middleware for merchant images upload (2-5 images)
export const uploadMerchantImages = (req: Request, res: Response, next: NextFunction) => {
  const merchantImagesUpload = upload.array('images', 5);
  
  merchantImagesUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('Image size should be less than 5MB', 400));
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new AppError('Maximum 5 images allowed', 400));
      }
      return next(new AppError(err.message, 400));
    } else if (err) {
      return next(new AppError(err.message, 400));
    }
    
    // Check if at least 2 images are uploaded
    if (!req.files || (req.files as Express.Multer.File[]).length < 2) {
      return next(new AppError('Please upload at least 2 images', 400));
    }
    
    // Add image paths to request body
    req.body.images = (req.files as Express.Multer.File[]).map(
      file => `/uploads/merchants/${file.filename}`
    );
    
    next();
  });
};

// Middleware for updating merchant profile images (optional update)
export const updateMerchantImages = (req: Request, res: Response, next: NextFunction) => {
  // If no file upload is in the request, just continue
  if (!req.files && !req.file) {
    return next();
  }
  
  const merchantImagesUpload = upload.array('images', 5);
  
  merchantImagesUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('Image size should be less than 5MB', 400));
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new AppError('Maximum 5 images allowed', 400));
      }
      return next(new AppError(err.message, 400));
    } else if (err) {
      return next(new AppError(err.message, 400));
    }
    
    // If files are uploaded, check that there are between 2 and 5 images
    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      if ((req.files as Express.Multer.File[]).length < 2) {
        return next(new AppError('Please upload at least 2 images', 400));
      }
      
      // Add image paths to request body
      req.body.images = (req.files as Express.Multer.File[]).map(
        file => `/uploads/merchants/${file.filename}`
      );
    }
    
    next();
  });
}; 