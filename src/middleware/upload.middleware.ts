import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../utils/appError';

// Set storage engine for merchant images
const merchantStorage = multer.diskStorage({
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

// Set storage engine for user profile images
const userStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/users');
    
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

// Initialize upload for merchants
const merchantUpload = multer({
  storage: merchantStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter
});

// Initialize upload for users
const userUpload = multer({
  storage: userStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max file size
  fileFilter,
  preservePath: true
});

// Middleware for merchant images upload (2-5 images)
export const uploadMerchantImages = (req: Request, res: Response, next: NextFunction) => {
  const merchantImagesUpload = merchantUpload.array('images', 5);
  
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
  
  const merchantImagesUpload = merchantUpload.array('images', 5);
  
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

// Middleware for user profile image upload
export const uploadUserProfileImage = (req: Request, res: Response, next: NextFunction) => {
  const upload = userUpload.single('profileImage');
  
  upload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('Image size should be less than 2MB', 400));
      }
      return next(new AppError(err.message, 400));
    } else if (err) {
      return next(new AppError(err.message, 400));
    }
    
    // If a file was uploaded, add the path to the request body
    if (req.file) {
      req.body.profileImage = `/uploads/users/${req.file.filename}`;
    }

    // Parse form fields if they exist
    if (req.body.fields) {
      try {
        const fields = JSON.parse(req.body.fields);
        req.body = { ...req.body, ...fields };
      } catch (error) {
        console.error('Error parsing form fields:', error);
        return next(new AppError('Invalid form data format', 400));
      }
    }
    
    next();
  });
};

// Middleware for updating user profile image (optional update)
export const updateUserProfileImage = (req: Request, res: Response, next: NextFunction) => {
  // If no file upload is in the request, just continue
  if (!req.file) {
    return next();
  }
  
  const profileImageUpload = userUpload.single('profileImage');
  
  profileImageUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('Image size should be less than 2MB', 400));
      }
      return next(new AppError(err.message, 400));
    } else if (err) {
      return next(new AppError(err.message, 400));
    }
    
    // If a file was uploaded, add the path to the request body
    if (req.file) {
      req.body.profileImage = `/uploads/users/${req.file.filename}`;
    }
    
    next();
  });
}; 