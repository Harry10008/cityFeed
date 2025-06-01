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
      console.log('Raw request body:', req.body);

      // Parse nested objects and arrays from form data
      const parsedData = { ...req.body };

      // Handle businessAddress - always parse if it's a string
      if (typeof req.body.businessAddress === 'string') {
        try {
          const parsedAddress = JSON.parse(req.body.businessAddress);
          parsedData.businessAddress = parsedAddress;
        } catch (error) {
          console.error('Business address parsing error:', error);
          throw new AppError('Invalid business address format. Please provide a valid JSON object with street, line1, and pincode', 400);
        }
      }

      // Handle offers - always parse if it's a string
      if (typeof req.body.offers === 'string') {
        try {
          if (req.body.offers === '') {
            parsedData.offers = [];
          } else {
            const parsedOffers = JSON.parse(req.body.offers);
            parsedData.offers = parsedOffers;
          }
        } catch (error) {
          console.error('Offers parsing error:', error);
          throw new AppError('Invalid offers format. Please provide a valid JSON array of offer IDs', 400);
        }
      }

      // Handle businessImages from files
      if (req.files && Array.isArray(req.files)) {
        parsedData.businessImages = req.files.map((file: any) => file.path);
      }

      console.log('Parsed data before validation:', parsedData);

      // Validate the parsed data
      const validatedData = CreateMerchantDto.parse(parsedData);
      console.log('Validated data:', validatedData);

      const { merchant, token } = await this.merchantService.register(validatedData);
      
      res.status(201).json({
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
          },
          token
        },
        message: 'Registration successful. Please check your email to verify your account.'
      });
    } catch (error) {
      console.error('Registration error:', error);
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
            isVerified: merchant.isVerified
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