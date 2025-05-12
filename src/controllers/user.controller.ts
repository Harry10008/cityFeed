import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from '../dto/user.dto';
import { AppError } from '../utils/appError';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = CreateUserDto.parse(req.body);
      const { user, token } = await this.userService.register(userData);
      
      res.status(201).json({
        status: 'success',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginData = LoginUserDto.parse(req.body);
      const { user, token } = await this.userService.login(loginData);
      
      res.status(200).json({
        status: 'success',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.getProfile(req.user._id);
      
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

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updateData = UpdateUserDto.parse(req.body);
      const user = await this.userService.updateProfile(req.user._id, updateData);
      
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

  updateMembershipType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { membershipType } = req.body;
      if (!['basic', 'premium', 'vip'].includes(membershipType)) {
        throw new AppError('Invalid membership type', 400);
      }

      const user = await this.userService.updateMembershipType(req.user._id, membershipType);
      
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
} 