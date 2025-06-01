import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { IMerchant } from '../interfaces/merchant.interface';
import { UserService } from '../services/user.service';
import { AppError } from '../utils/appError';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    isVerified: boolean;
  };
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      id: string;
      role: string;
      isVerified: boolean;
    };

    // Check if user exists
    const userService = new UserService();
    const user = await userService.findById(decoded.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if user is verified
    if (!decoded.isVerified) {
      throw new AppError('Please verify your email before accessing this resource', 403);
    }

    // Attach user to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      isVerified: decoded.isVerified
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

export const authenticateMerchant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await authenticateUser(req, res, () => {
      if (req.user?.role !== 'merchant') {
        throw new AppError('Access denied. Merchant role required.', 403);
      }
      next();
    });
  } catch (error) {
    next(error);
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