import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AppError } from '../utils/appError';
import { CreateUserDto, LoginUserDto } from '../dto/user.dto';
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
            email: user.email,
            fullName: user.fullName
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
      if (!decoded || !decoded.userId) {
        throw new AppError('Invalid token', 400);
      }
  
      // Update user verification status
      const user = await this.userService.verifyUser(decoded.userId);
      
      res.status(200).json({
        status: 'success',
        message: 'Email verified successfully',
        data: {
          user
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
            email: user.email,
            fullName: user.fullName
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
          user
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
          user
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
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  };
} 