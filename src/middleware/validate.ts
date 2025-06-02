import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Log the request body for debugging
      console.log('Request body:', req.body);
      
      // For multipart/form-data, handle files first
      if (req.files) {
        // If there are files, they are already parsed by multer
        // You can access them via req.files
        console.log('Files:', req.files);
      }
      
      // Parse address if it's a string
      if (req.body.address && typeof req.body.address === 'string') {
        try {
          req.body.address = JSON.parse(req.body.address);
        } catch (error) {
          res.status(400).json({
            status: 'error',
            message: 'Invalid address format. Address must be a valid JSON object.'
          });
          return;
        }
      }
      
      // Parse and validate the request body
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 'error',
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
        return;
      }
        next(error);
    }
  };
};
