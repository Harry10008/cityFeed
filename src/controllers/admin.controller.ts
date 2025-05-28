import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { CreateAdminDto, EmailUpdateDto, UpdateAdminDto, VerifyEmailDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from '../dto/admin.dto';
import { AppError } from '../utils/appError';
import { verifyToken } from '../utils/emailService';
import { AuthRequest } from '../middleware/auth';
import { config } from '../config';
import { sendEmail } from '../utils/email';
import crypto from 'crypto';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

  getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin?.id) {
        throw new AppError('Not authenticated', 401);
      }

      const admin = await this.adminService.getProfile(req.admin.id);
      
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
      if (!req.admin?.id) {
        throw new AppError('Not authenticated', 401);
      }

      // Check if trying to update email
      if ('email' in req.body) {
        throw new AppError(
          'Email cannot be updated through this endpoint. Please use /profile/email/initiate',
          400
        );
      }
      
      const updateData = UpdateAdminDto.parse(req.body);
      const admin = await this.adminService.updateProfile(req.admin.id, updateData);
      
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

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = ForgotPasswordDto.parse(req.body);
      const admin = await this.adminService.findByEmail(email);

      if (!admin) {
        throw new AppError('Admin not found', 404);
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Save hashed token to admin
      await this.adminService.update(admin._id.toString(), {
        resetToken: hashedToken,
        resetTokenExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      });

      // Send reset email
      const resetUrl = `${config.clientUrl}/admin/reset-password?token=${resetToken}`;
      await sendEmail({
        email: admin.email,
        subject: 'Admin Password Reset Request',
        message: `To reset your password, click on this link: ${resetUrl}\n\nThis link will expire in 10 minutes.`
      });

      res.status(200).json({
        status: 'success',
        message: 'Password reset email sent'
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, password } = ResetPasswordDto.parse(req.body);

      // Hash the token
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Find admin with valid reset token
      const admin = await this.adminService.findByResetToken(hashedToken);

      if (!admin || !admin.resetTokenExpires || admin.resetTokenExpires < new Date()) {
        throw new AppError('Invalid or expired reset token', 400);
      }

      // Update password and clear reset token
      await this.adminService.update(admin._id.toString(), {
        password,
        resetToken: undefined,
        resetTokenExpires: undefined
      });

      res.status(200).json({
        status: 'success',
        message: 'Password reset successful'
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin?.id) {
        throw new AppError('Not authenticated', 401);
      }

      const { currentPassword, newPassword } = ChangePasswordDto.parse(req.body);

      const admin = await this.adminService.findById(req.admin.id);
      if (!admin) {
        throw new AppError('Admin not found', 404);
      }

      // Verify current password
      const isPasswordValid = await this.adminService.verifyPassword(currentPassword, admin.password);
      if (!isPasswordValid) {
        throw new AppError('Current password is incorrect', 401);
      }

      // Update password
      await this.adminService.update(req.admin.id, { password: newPassword });

      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  };
} 