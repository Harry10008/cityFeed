import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../utils/appError';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // For multipart/form-data, the data is in req.body.fields
      const data = req.body.fields || req.body;
      
      // Parse and validate the data
      const validatedData = await schema.parseAsync(data);
      
      // Update the request body with validated data
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format validation errors
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        
        // Create a detailed error message
        const errorMessage = formattedErrors
          .map(err => `${err.field}: ${err.message}`)
          .join(', ');
        
        next(new AppError(errorMessage, 400));
      } else if (error instanceof Error) {
        // Handle custom errors from transformations
        next(new AppError(error.message, 400));
      } else {
        next(new AppError('Validation failed', 400));
      }
    }
  };
};
