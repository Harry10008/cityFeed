import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AppError } from '../utils/appError';
import { SMSService } from '../utils/smsService';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, token } = await this.userService.register(req.body);
      
      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: { user, token }
      });
    } catch (error) {
      if (error.message.includes('already registered')) {
        return next(new AppError(error.message, 400));
      }
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.params;
      const user = await this.userService.verifyUser(token);
      
      res.status(200).json({
        status: 'success',
        message: 'Email verified successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  };
  
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, token } = await this.userService.login(req.body);
      
      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: { user, token }
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?._id) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await this.userService.getProfile(req.user._id);
      
      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?._id) {
        throw new AppError('User not authenticated', 401);
      }
      
      // Validate phone number if it's being updated
      if (req.body.phone && !SMSService.validatePhoneNumber(req.body.phone)) {
        throw new AppError('Invalid phone number format', 400);
      }

      const user = await this.userService.updateProfile(req.user._id, req.body);
      
      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  };
  
  updateProfileImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?._id) {
        throw new AppError('User not authenticated', 401);
      }

      // If no image was uploaded, return an error
      if (!req.file && !req.body.profileImage) {
        throw new AppError('No profile image provided', 400);
      }
      
      // Profile image path is added to req.body by the upload middleware
      const user = await this.userService.updateProfile(req.user._id, { 
        profileImage: req.body.profileImage 
      });
      
      res.status(200).json({
        status: 'success',
        message: 'Profile image updated successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  };
  
  updateMembership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?._id) {
        throw new AppError('User not authenticated', 401);
      }

      const { membershipType } = req.body;
      const allowedTypes = ['basic', 'bronze', 'silver', 'gold', 'platinum'];
  
      if (!allowedTypes.includes(membershipType)) {
        throw new AppError('Invalid membership type', 400);
      }
  
      // Check if non-admin is trying to assign "platinum"
      if (membershipType === 'platinum' && req.user.role !== 'admin') {
        throw new AppError('Only admins can assign platinum membership', 403);
      }
  
      const user = await this.userService.updateMembership(req.user._id, membershipType);
  
      res.status(200).json({
        status: 'success',
        message: 'Membership updated successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  };
  
  initiateEmailUpdate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?._id) {
        throw new AppError('User not authenticated', 401);
      }

      const { newEmail } = req.body;
      if (!newEmail) {
        throw new AppError('New email is required', 400);
      }

      await this.userService.initiateEmailUpdate(req.user._id, newEmail);
      
      res.status(200).json({
        status: 'success',
        message: 'OTP sent to new email address'
      });
    } catch (error) {
      next(error);
    }
  };

  verifyAndUpdateEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?._id) {
        throw new AppError('User not authenticated', 401);
      }

      const { newEmail, otp } = req.body;
      if (!newEmail || !otp) {
        throw new AppError('New email and OTP are required', 400);
      }

      const user = await this.userService.verifyAndUpdateEmail(req.user._id, newEmail, otp);
      
      res.status(200).json({
        status: 'success',
        message: 'Email updated successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      await this.userService.forgotPassword(email);
      
      res.status(200).json({
        status: 'success',
        message: 'Password reset instructions sent to email'
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, password } = req.body;
      await this.userService.resetPassword(token, password);
      
      res.status(200).json({
        status: 'success',
        message: 'Password reset successful'
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?._id) {
        throw new AppError('User not authenticated', 401);
      }

      const { currentPassword, newPassword } = req.body;
      await this.userService.changePassword(req.user._id, currentPassword, newPassword);
      
      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  };
} 