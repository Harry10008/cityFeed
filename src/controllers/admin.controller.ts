import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { AppError } from '../utils/appError';
import { sendVerificationEmail } from '../utils/emailService';
import { Admin } from '../models/admin.model';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { createAdminSchema, loginAdminSchema } from '../dto/admin.dto';
import { AuthRequest } from '../interfaces/auth.interface';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminData = createAdminSchema.parse(req.body);
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
        message: 'Registration successful. Please check your email to verify your account.'
      });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;
      if (!token) {
        throw new AppError('Verification token is required', 400);
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
      const admin = await this.adminService.verifyAdmin(decoded.id);
      
      res.status(200).json({
        status: 'success',
        message: 'Email verified successfully',
        data: { admin }
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(new AppError('Invalid or expired token', 400));
      } else {
      next(error);
      }
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginData = loginAdminSchema.parse(req.body);
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

  getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new AppError('Not authenticated', 401);
      }

      const admin = await this.adminService.getProfile(req.user.id);
      
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

  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new AppError('Not authenticated', 401);
      }

      const admin = await this.adminService.updateProfile(req.user.id, req.body);
      
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

  updateEmail = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new AppError('Not authenticated', 401);
      }

      const { newEmail } = req.body;
      const admin = await this.adminService.updateEmail(req.user.id, newEmail);
      res.status(200).json({
        status: 'success',
        message: 'Email updated successfully. Please verify your new email.',
        data: { admin }
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const admin = await Admin.findOne({ email });
      
      if (!admin) {
        throw new AppError('No admin found with that email address', 404);
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      admin.resetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      admin.resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await admin.save();

      // Send reset email
      try {
        await sendVerificationEmail(admin.email, resetToken);
        res.status(200).json({
          status: 'success',
          message: 'Password reset email sent'
        });
      } catch (error) {
        admin.resetToken = undefined;
        admin.resetTokenExpires = undefined;
        await admin.save();
        throw new AppError('Error sending email. Please try again later.', 500);
      }
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;
      
      // Hash token
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const admin = await Admin.findOne({
        resetToken: hashedToken,
        resetTokenExpires: { $gt: Date.now() }
      });

      if (!admin) {
        throw new AppError('Token is invalid or has expired', 400);
      }

      // Update password
      admin.password = password;
      admin.resetToken = undefined;
      admin.resetTokenExpires = undefined;
      await admin.save();

      res.status(200).json({
        status: 'success',
        message: 'Password reset successful'
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw new AppError('Not authenticated', 401);
      }

      const { currentPassword, newPassword } = req.body;
      const admin = await Admin.findById(req.user.id).select('+password');

      if (!admin) {
        throw new AppError('Admin not found', 404);
      }

      // Check current password
      const isPasswordValid = await admin.comparePassword(currentPassword);
      if (!isPasswordValid) {
        throw new AppError('Current password is incorrect', 401);
      }

      // Update password
      admin.password = newPassword;
      await admin.save();

      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  };
} 