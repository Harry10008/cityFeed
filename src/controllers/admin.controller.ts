import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { AppError } from '../utils/appError';
import { verifyToken } from '../utils/emailService';
import { CreateAdminDto, LoginAdminDto } from '../dto/admin.dto';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse and validate the request body using CreateAdminDto
      const adminData = CreateAdminDto.parse(req.body);
      const { admin, token } = await this.adminService.register(adminData);
      
      res.status(201).json({
        status: 'success',
        data: {
          admin: {
            id: admin._id,
            email: admin.email,
            fullName: admin.fullName
          },
          token
        },
        message: 'Admin registered successfully.'
      });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        throw new AppError('Verification token is required', 400);
      }
  
      // Verify the token
      const { userId } = verifyToken(token);
  
      // Update admin verification status
      const admin = await this.adminService.verifyAdmin(userId);
      
      res.status(200).json({
        status: 'success',
        message: 'Email verified successfully',
        data: {
          admin
        }
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginData = LoginAdminDto.parse(req.body);
      const { admin, token } = await this.adminService.login(loginData);
      
      res.status(200).json({
        status: 'success',
        data: {
          admin: {
            id: admin._id,
            email: admin.email,
            fullName: admin.fullName
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?._id) {
        throw new AppError('Not authenticated', 401);
      }

      const admin = await this.adminService.getProfile(req.user._id);
      
      res.status(200).json({
        status: 'success',
        data: {
          admin
        }
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?._id) {
        throw new AppError('Not authenticated', 401);
      }

      const admin = await this.adminService.updateProfile(req.user._id, req.body);
      
      res.status(200).json({
        status: 'success',
        data: {
          admin
        }
      });
    } catch (error) {
      next(error);
    }
  };

  updateEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?._id) {
        throw new AppError('Admin not authenticated', 401);
      }

      const { newEmail } = req.body;
      if (!newEmail) {
        throw new AppError('New email is required', 400);
      }

      const admin = await this.adminService.updateEmail(req.user._id, newEmail);
      
      res.status(200).json({
        status: 'success',
        message: 'Email updated successfully. Please check your new email for verification.',
        data: { admin }
      });
    } catch (error) {
      next(error);
    }
  };
} 