import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { IMerchant } from '../interfaces/merchant.interface';
import { Merchant } from '../models/merchant.model';

export interface AuthRequest extends Request {
  user?: IMerchant;
  merchant?: IMerchant;
  admin?: {
    id: string;
    email: string;
    role: string;
  };
}

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export const authenticateMerchant = async (
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

    if (decoded.role !== 'merchant') {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. Merchant role required.',
      });
      return;
    }

    // Fetch merchant from database to get full merchant data
    const merchant = await Merchant.findById(decoded.id).select('-password');
    if (!merchant) {
      res.status(401).json({
        status: 'error',
        message: 'Merchant not found',
      });
      return;
    }

    req.merchant = merchant;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token',
    });
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
      id: decoded.id,
      email: decoded.email,
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