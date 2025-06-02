import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError';
import { User } from '../models/user.model';
import { Merchant } from '../models/merchant.model';
import { AuthRequest, IUser, IMerchant } from './auth';

interface JwtPayload {
  userId: string;
  email: string;
  role: 'user' | 'merchant' | 'admin';
  isVerified: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
      merchant?: any;
    }
  }
}

export const protect = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    // 1) Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('No token provided. Please log in to access this route', 401);
    }

    const token = authHeader.split(' ')[1];

    // 2) Verify token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key') as JwtPayload;
    } catch (error) {
      throw new AppError('Invalid token. Please log in again', 401);
    }

    // 3) Check if user/merchant still exists based on role
    if (decoded.role === 'merchant') {
      const merchant = await Merchant.findById(decoded.userId).select('+isVerified');
      if (!merchant) {
        throw new AppError('Merchant account no longer exists', 401);
      }
      if (!merchant.isVerified) {
        throw new AppError('Please verify your email to access this route', 401);
      }
      req.merchant = merchant as IMerchant;
    } else {
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new AppError('User account no longer exists', 401);
      }
      req.user = user as IUser;
    }

    // 4) Grant access to protected route
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Authentication failed. Please log in again', 401));
    }
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    const merchantRole = req.merchant?.role;
    const role = userRole || merchantRole;

    if (!role) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    if (!roles.includes(role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
}; 