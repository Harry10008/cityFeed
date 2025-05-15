import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { CreateAdminDto, EmailUpdateDto, UpdateAdminDto, VerifyEmailDto } from '../dto/admin.dto';
import { AppError } from '../utils/appError';
import { verifyToken } from '../utils/emailService';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminData = CreateAdminDto.parse(req.body);
      const { admin, token } = await this.adminService.register(adminData);
      
      res.status(201).json({
        status: 'success',
        data: {
          admin,
          token
        },
        message: 'Registration successful. Please check your email to verify your account.'
      });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        throw new AppError('Verification token is required', 400);
      }
  
      // Verify the token
      const { userId } = verifyToken(token);
  
      // Update admin verification status
      const admin = await this.adminService.verifyAdmin(userId);
      
      return res.status(200).json({
        status: 'success',
        message: 'Email verified successfully',
        data: {
          admin
        }
      });
    } catch (error) {
      return next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginData = CreateAdminDto.pick({ email: true, password: true }).parse(req.body);
      const { admin, token } = await this.adminService.login(loginData);
      
      res.status(200).json({
        status: 'success',
        data: {
          admin,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
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

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if trying to update email
      if ('email' in req.body) {
        throw new AppError(
          'Email cannot be updated through this endpoint. Please use /profile/email/initiate',
          400
        );
      }
      
      const updateData = UpdateAdminDto.parse(req.body);
      const admin = await this.adminService.updateProfile(req.user._id, updateData);
      
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

  initiateEmailUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { newEmail } = EmailUpdateDto.parse(req.body);
      
      await this.adminService.initiateEmailUpdate(req.user._id, newEmail);
      
      return res.status(200).json({
        status: 'success',
        message: 'OTP sent to new email address. Please check your email and verify within 10 minutes.'
      });
    } catch (error) {
      return next(error);
    }
  };
  
  verifyAndUpdateEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { newEmail, otp } = VerifyEmailDto.parse(req.body);
      
      const admin = await this.adminService.verifyAndUpdateEmail(req.user._id, newEmail, otp);
      
      return res.status(200).json({
        status: 'success',
        message: 'Email updated successfully',
        data: {
          admin
        }
      });
    } catch (error) {
      return next(error);
    }
  };

  updatePermissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { permissions } = req.body;
      if (!Array.isArray(permissions)) {
        throw new AppError('Permissions must be an array', 400);
      }

      const admin = await this.adminService.updatePermissions(req.user._id, permissions);
      
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

  getAllAdmins = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const admins = await this.adminService.getAllAdmins();
      
      res.status(200).json({
        status: 'success',
        data: {
          admins
        }
      });
    } catch (error) {
      next(error);
    }
  };
} 