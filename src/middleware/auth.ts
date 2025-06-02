import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { Document, Types } from 'mongoose';
import { AppError } from '../utils/appError';
import { User } from '../models/user.model';
import { Merchant } from '../models/merchant.model';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  role: string;
  isVerified: boolean;
}

export interface IMerchant extends Document {
  _id: Types.ObjectId;
  email: string;
  role: string;
  isVerified: boolean;
}

export interface AuthRequest extends Request {
  user?: IUser;
  merchant?: IMerchant;
  admin?: {
    id: string;
    email: string;
    role: string;
  };
}

interface JwtPayload {
  userId: string;
  email?: string;
  role: string;
  isVerified?: boolean;
}

export const authenticateUser = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;

    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if user is verified
    if (!user.isVerified) {
      throw new AppError('Please verify your email before accessing this resource', 403);
    }

    // Attach user to request
    req.user = user as IUser;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

export const authenticateMerchant = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;

    // Check if merchant exists
    const merchant = await Merchant.findById(decoded.userId).select('+isVerified');
    if (!merchant) {
      throw new AppError('Merchant not found', 404);
    }

    // Check if merchant is verified
    if (!merchant.isVerified) {
      throw new AppError('Please verify your email before accessing this resource', 403);
    }

    // Check if merchant role
    if (decoded.role !== 'merchant') {
      throw new AppError('Access denied. Merchant role required.', 403);
    }

    // Attach merchant to request
    req.merchant = merchant as IMerchant;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

export const authenticateAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'error',
        message: 'No token provided',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    if (!['admin', 'super_admin'].includes(decoded.role)) {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin role required.',
      });
      return;
    }

    req.admin = {
      id: decoded.userId,
      email: decoded.email || '',
      role: decoded.role
    };
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token',
    });
  }
}; 