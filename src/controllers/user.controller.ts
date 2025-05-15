import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from '../dto/user.dto';
import { AppError } from '../utils/appError';
import { verifyToken } from '../utils/emailService'; // adjust path if needed
import { SMSService } from '../utils/smsService';

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
      if (error.message.includes('already registered')) {
        return next(new AppError(error.message, 400));
      }
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        throw new AppError('Verification token is required', 400);
      }
  
      const { userId } = verifyToken(token);
  
      const user = await this.userService.verifyUser(userId);
      res.status(200).json({
        status: 'success',
        message: 'Email verified successfully',
        user
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
      // Check if trying to update email or phone
      if ('email' in req.body) {
        throw new AppError(
          'Email cannot be updated through this endpoint. Please use /profile/email/initiate',
          400
        );
      }
      
      if ('phone' in req.body) {
        throw new AppError(
          'Phone number cannot be updated through this endpoint. Please use /profile/phone/initiate',
          400
        );
      }

      const updateData = UpdateUserDto.parse(req.body);
      
      // Validate phone number if it's being updated
      if (updateData.phone && !SMSService.validatePhoneNumber(updateData.phone)) {
        throw new AppError('Invalid phone number format', 400);
      }

      const user = await this.userService.updateProfile(req.user._id, updateData);
      
      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  };
  
  updateProfileImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
  
  updateMembershipType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { membershipType } = req.body;
      const allowedTypes = ['basic', 'bronze', 'silver', 'gold', 'platinum'];
  
      if (!allowedTypes.includes(membershipType)) {
        console.log("membership type",membershipType)
        throw new AppError('Invalid membership type', 400);
      }
  
      // Check if non-admin is trying to assign "platinum"
      if (membershipType === 'platinum' && req.user.role !== 'admin') {
        throw new AppError('Only admins can assign platinum membership', 403);
      }
  
      const user = await this.userService.updateMembershipType(req.user._id, membershipType);
  
      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  };
  
  initiateEmailUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Request body:", req.body);
      console.log("Content-Type:", req.headers['content-type']);
      
      const { newEmail } = req.body;
      
      if (!newEmail) {
        console.log("newEmail is missing from body");
        throw new AppError('New email is required', 400);
      }

      await this.userService.initiateEmailUpdate(req.user._id, newEmail);
      
      res.status(200).json({
        status: 'success',
        message: 'OTP sent to new email address. Please check your email and verify within 10 minutes.'
      });
    } catch (error) {
      next(error);
    }
  };

  verifyAndUpdateEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
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

  initiateMobileUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { newPhone } = req.body;
      
      if (!newPhone) {
        throw new AppError('New phone number is required', 400);
      }

      await this.userService.initiateMobileUpdate(req.user._id, newPhone);
      
      res.status(200).json({
        status: 'success',
        message: 'OTP sent to new phone number. Please check your phone and verify within 10 minutes.'
      });
    } catch (error) {
      next(error);
    }
  };

  verifyAndUpdateMobile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { newPhone, otp } = req.body;
      
      if (!newPhone || !otp) {
        throw new AppError('New phone number and OTP are required', 400);
      }

      const user = await this.userService.verifyAndUpdateMobile(req.user._id, newPhone, otp);
      
      res.status(200).json({
        status: 'success',
        message: 'Phone number updated successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  };
} 