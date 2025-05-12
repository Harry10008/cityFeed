import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../utils/appError';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body); // ✅ parse body directly
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(error); // this will hit your errorHandler middleware
      } else {
        next(new AppError('Validation failed', 400));
      }
    }
  };
};
