import { Request, Response, NextFunction } from 'express';
import { MerchantService } from '../services/merchant.service';
import { CreateMerchantDto, EmailUpdateDto, UpdateMerchantDto, VerifyEmailDto } from '../dto/merchant.dto';
import { verifyToken } from '../utils/emailService';
import { AppError } from '../utils/appError';

export class MerchantController {
  private merchantService: MerchantService;

  constructor() {
    this.merchantService = new MerchantService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const merchantData = CreateMerchantDto.parse(req.body);
      const { merchant, token } = await this.merchantService.register(merchantData);
      
      res.status(201).json({
        status: 'success',
        data: {
          merchant,
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
  
      // Update merchant verification status
      const merchant = await this.merchantService.verifyMerchant(userId);
      
      return res.status(200).json({
        status: 'success',
        message: 'Email verified successfully',
        data: {
          merchant
        }
      });
    } catch (error) {
      return next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginData = CreateMerchantDto.pick({ email: true, password: true }).parse(req.body);
      const { merchant, token } = await this.merchantService.login(loginData);
      
      res.status(200).json({
        status: 'success',
        data: {
          merchant,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const merchant = await this.merchantService.getProfile(req.user._id);
      
      res.status(200).json({
        status: 'success',
        data: {
          merchant
        }
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // If images are uploaded, they're already added to req.body by the upload middleware
      const updateData = UpdateMerchantDto.parse(req.body);
      const merchant = await this.merchantService.updateProfile(req.user._id, updateData);
      
      res.status(200).json({
        status: 'success',
        data: {
          merchant
        }
      });
    } catch (error) {
      next(error);
    }
  };

  initiateEmailUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { newEmail } = EmailUpdateDto.parse(req.body);
      
      await this.merchantService.initiateEmailUpdate(req.user._id, newEmail);
      
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
      
      const merchant = await this.merchantService.verifyAndUpdateEmail(req.user._id, newEmail, otp);
      
      return res.status(200).json({
        status: 'success',
        message: 'Email updated successfully',
        data: {
          merchant
        }
      });
    } catch (error) {
      return next(error);
    }
  };

  getMerchants = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category } = req.params;
      const { foodPreference } = req.query;
      
      let merchants;
      
      if (category === 'all' && !foodPreference) {
        // Get all merchants
        merchants = await this.merchantService.getAllMerchants();
      } else if (category === 'all' && foodPreference) {
        // Filter by food preference only
        merchants = await this.merchantService.getMerchantsByFoodPreference(
          foodPreference as 'veg' | 'nonveg' | 'both'
        );
      } else if (category !== 'all' && !foodPreference) {
        // Filter by category only
        merchants = await this.merchantService.getMerchantsByCategory(category);
      } else {
        // Filter by both category and food preference
        merchants = await this.merchantService.getMerchantsByCategoryAndFoodPreference(
          category,
          foodPreference as 'veg' | 'nonveg' | 'both'
        );
      }
      
      return res.status(200).json({
        status: 'success',
        data: {
          merchants
        }
      });
    } catch (error) {
      return next(error);
    }
  };
} 