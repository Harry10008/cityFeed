import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AppError } from '../utils/appError';
import { CreateUserDto, LoginUserDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from '../dto/user.dto';
import { verifyToken } from '../utils/emailService';
import { AuthRequest } from '../middleware/auth';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse and validate the request body using CreateUserDto
      const userData = CreateUserDto.parse(req.body);
      const { user, token } = await this.userService.register(userData);
      
      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            walletCoins: user.walletCoins,
            role: user.role,
            isActive: user.isActive,
            isVerified: user.isVerified,
            membershipType: user.membershipType,
            dateOfBirth: user.dateOfBirth,
            address: user.address
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
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        throw new AppError('Verification token is required', 400);
      }
  
      // Verify the token
      const decoded = verifyToken(token);
      if (!decoded || !decoded.id) {
        throw new AppError('Invalid token', 400);
      }
  
      // Update user verification status
      const user = await this.userService.verifyUser(decoded.id);
      
      res.status(200).json({
        status: 'success',
        message: 'Email verified successfully',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            walletCoins: user.walletCoins,
            role: user.role,
            isActive: user.isActive,
            isVerified: user.isVerified,
            membershipType: user.membershipType,
            dateOfBirth: user.dateOfBirth,
            address: user.address
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginData = LoginUserDto.parse(req.body);
      const { user, token } = await this.userService.login(loginData);
      
      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            walletCoins: user.walletCoins,
            role: user.role,
            isActive: user.isActive,
            isVerified: user.isVerified,
            membershipType: user.membershipType,
            dateOfBirth: user.dateOfBirth,
            address: user.address
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

      const user = await this.userService.getProfile(req.user.id);
      
      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            walletCoins: user.walletCoins,
            role: user.role,
            isActive: user.isActive,
            isVerified: user.isVerified,
            membershipType: user.membershipType,
            dateOfBirth: user.dateOfBirth,
            address: user.address,
            profileImage: user.profileImage
          }
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

      const user = await this.userService.updateProfile(req.user.id, req.body);
      
      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            walletCoins: user.walletCoins,
            role: user.role,
            isActive: user.isActive,
            isVerified: user.isVerified,
            membershipType: user.membershipType,
            dateOfBirth: user.dateOfBirth,
            address: user.address,
            profileImage: user.profileImage
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  updateEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?._id) {
        throw new AppError('User not authenticated', 401);
      }

      const { newEmail } = req.body;
      if (!newEmail) {
        throw new AppError('New email is required', 400);
      }

      const user = await this.userService.updateEmail(req.user._id, newEmail);
      
      res.status(200).json({
        status: 'success',
        message: 'Email updated successfully. Please check your new email for verification.',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            walletCoins: user.walletCoins,
            role: user.role,
            isActive: user.isActive,
            isVerified: user.isVerified,
            membershipType: user.membershipType,
            dateOfBirth: user.dateOfBirth,
            address: user.address
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = ForgotPasswordDto.parse(req.body);
      await this.userService.forgotPassword(email);
      
      res.status(200).json({
        status: 'success',
        message: 'Password reset instructions sent to your email'
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, password } = ResetPasswordDto.parse(req.body);
      await this.userService.resetPassword(token, password);
      
      res.status(200).json({
        status: 'success',
        message: 'Password has been reset successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new AppError('Not authenticated', 401);
      }

      const { currentPassword, newPassword } = ChangePasswordDto.parse(req.body);
      await this.userService.changePassword(req.user.id, currentPassword, newPassword);
      
      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  updateMembershipType = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new AppError('Not authenticated', 401);
      }

      const { membershipType } = req.body;
      if (!['basic', 'bronze', 'silver', 'gold', 'platinum'].includes(membershipType)) {
        throw new AppError('Invalid membership type', 400);
      }

      const user = await this.userService.updateMembershipType(req.user.id, membershipType);
      
      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            walletCoins: user.walletCoins,
            role: user.role,
            isActive: user.isActive,
            isVerified: user.isVerified,
            membershipType: user.membershipType,
            dateOfBirth: user.dateOfBirth,
            address: user.address
          }
        },
        message: 'Membership type updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };
} 