import { Request, Response, NextFunction } from 'express';
import { MerchantService } from '../services/merchant.service';
import { AppError } from '../utils/appError';
import { CreateMerchantDto, LoginMerchantDto } from '../dto/merchant.dto';
import { verifyToken } from '../utils/emailService';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

export class MerchantController {
  private merchantService: MerchantService;

  constructor() {
    this.merchantService = new MerchantService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const merchantData = {
        ...req.body,
        businessAddress: req.body.businessAddress,
        offers: req.body.offers || [],
        businessImages: req.files ? (req.files as Express.Multer.File[]).map(file => file.path) : []
      };

      // Validate the merchant data
      const validatedData = CreateMerchantDto.parse(merchantData);
      const result = await this.merchantService.register(validatedData);
      
      res.status(201).json({
        status: 'success',
        data: result,
        message: 'Registration successful. Please check your email to verify your account.'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod validation errors
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return next(new AppError('Validation error', 400, formattedErrors));
      }
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        throw new AppError('Verification token is required', 400);
      }
  
      const decoded = verifyToken(token);
      if (!decoded || !decoded.id) {
        throw new AppError('Invalid token', 400);
      }
  
      const merchant = await this.merchantService.verifyMerchant(decoded.id);
      
      res.status(200).json({
        status: 'success',
        message: 'Email verified successfully',
        data: {
          merchant: {
            id: merchant._id,
            businessName: merchant.businessName,
            businessAddress: merchant.businessAddress,
            email: merchant.email,
            phone: merchant.phone,
            businessType: merchant.businessType,
            businessDescription: merchant.businessDescription,
            businessImages: merchant.businessImages,
            isActive: merchant.isActive,
            isVerified: merchant.isVerified
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginData = LoginMerchantDto.parse(req.body);
      const { merchant, token } = await this.merchantService.login(loginData);
      
      res.status(200).json({
        status: 'success',
        data: {
          merchant: {
            id: merchant._id,
            businessName: merchant.businessName,
            businessAddress: merchant.businessAddress,
            email: merchant.email,
            phone: merchant.phone,
            businessType: merchant.businessType,
            businessDescription: merchant.businessDescription,
            businessImages: merchant.businessImages,
            isActive: merchant.isActive,
            isVerified: merchant.isVerified,
            role: merchant.role
          },
          token
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: 'fail',
          message: error.message
        });
        return;
      }
      next(error);
    }
  };

  getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new AppError('Not authenticated', 401);
      }

      const merchant = await this.merchantService.getProfile(req.user.id);
      
      res.status(200).json({
        status: 'success',
        data: {
          merchant: {
            id: merchant._id,
            businessName: merchant.businessName,
            businessAddress: merchant.businessAddress,
            email: merchant.email,
            phone: merchant.phone,
            businessType: merchant.businessType,
            businessDescription: merchant.businessDescription,
            businessImages: merchant.businessImages,
            isActive: merchant.isActive,
            isVerified: merchant.isVerified
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

      const merchant = await this.merchantService.updateProfile(req.user.id, req.body);
      
      res.status(200).json({
        status: 'success',
        data: {
          merchant: {
            id: merchant._id,
            businessName: merchant.businessName,
            businessAddress: merchant.businessAddress,
            email: merchant.email,
            phone: merchant.phone,
            businessType: merchant.businessType,
            businessDescription: merchant.businessDescription,
            businessImages: merchant.businessImages,
            isActive: merchant.isActive,
            isVerified: merchant.isVerified
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

      const merchant = await this.merchantService.updateEmail(req.user._id, newEmail);
      
      res.status(200).json({
        status: 'success',
        message: 'Email updated successfully. Please check your new email for verification.',
        data: {
          merchant: {
            id: merchant._id,
            businessName: merchant.businessName,
            businessAddress: merchant.businessAddress,
            email: merchant.email,
            phone: merchant.phone,
            businessType: merchant.businessType,
            businessDescription: merchant.businessDescription,
            businessImages: merchant.businessImages,
            isActive: merchant.isActive,
            isVerified: merchant.isVerified
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getMerchants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      
      res.status(200).json({
        status: 'success',
        data: {
          merchants
        }
      });
    } catch (error) {
      next(error);
    }
  };
} 