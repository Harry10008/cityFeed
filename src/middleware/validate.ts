import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../utils/appError';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Log the request body for debugging
      console.log('Request body:', req.body);
      
      // For multipart/form-data, handle files first
      if (req.files) {
        // If there are files, they are already parsed by multer
        // You can access them via req.files
        console.log('Files:', req.files);
      }
      
      // Parse and validate the request body
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        next(new AppError(errorMessage, 400));
      } else {
        next(error);
      }
    }
  };
};
