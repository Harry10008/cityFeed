import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import { AppError } from '../utils/appError';

interface RateLimitOptions {
  windowMs: number;  // Time window in milliseconds
  max: number;       // Max number of requests in the window
}

export const rateLimit = (options: RateLimitOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `ratelimit:${req.ip}:${req.path}`;
    
    try {
      const requests = await redisClient.incr(key);
      
      // Set expiry on first request
      if (requests === 1) {
        await redisClient.expire(key, Math.ceil(options.windowMs / 1000));
      }

      // Check if rate limit exceeded
      if (requests > options.max) {
        throw new AppError('Too many requests, please try again later', 429);
      }

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', options.max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, options.max - requests));
      
      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError('Rate limit error', 500));
      }
    }
  };
}; 