import { Request, Response, NextFunction } from 'express';
import { MerchantService } from '../services/merchant.service';
import { LoginMerchantDto } from '../dto/merchant.dto';
import { verifyToken } from '../utils/emailService';
import { AppError } from '../utils/appError';
import { AuthRequest } from '../middleware/auth';

export class MerchantController {
  private merchantService: MerchantService;

  constructor() {
    this.merchantService = new MerchantService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get image paths from uploaded files
      const businessImages = (req.files as Express.Multer.File[])?.map(file => `/uploads/merchants/${file.filename}`) || [];

      // Validate number of images
      if (businessImages.length < 3 || businessImages.length > 10) {
        throw new AppError('You must provide between 3 and 10 business images', 400);
      }

      // Add image paths to request body
      const merchantData = {
        ...req.body,
        businessImages
      };

      const { merchant, token } = await this.merchantService.register(merchantData);
      
      res.status(201).json({
        status: 'success',
        data: {
          merchant: {
            id: merchant._id,
            email: merchant.email,
            fullName: merchant.fullName,
            businessName: merchant.businessName,
            businessImages: merchant.businessImages || []
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
      const { userId } = verifyToken(token);
  
      // Update merchant verification status
      const merchant = await this.merchantService.verifyMerchant(userId);
      
      res.status(200).json({
        status: 'success',
        message: 'Email verified successfully',
        data: {
          merchant
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
            email: merchant.email,
            fullName: merchant.fullName,
            businessName: merchant.businessName,
            businessImages: merchant.businessImages || []
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
      if (!req.merchant?.id) {
        throw new AppError('Not authenticated', 401);
      }

      const merchant = await this.merchantService.getProfile(req.merchant.id);
      
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

  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.merchant?.id) {
        throw new AppError('Not authenticated', 401);
      }

      // Get image URLs from uploaded files
      const businessImages = (req.files as Express.Multer.File[])?.map(file => `/uploads/merchants/${file.filename}`) || [];
      const profileImage = (req.file as Express.Multer.File)?.filename 
        ? `/uploads/merchants/${(req.file as Express.Multer.File).filename}`
        : undefined;

      // If new business images are uploaded, validate the count
      if (businessImages.length > 0 && (businessImages.length < 3 || businessImages.length > 10)) {
        throw new AppError('You must provide between 3 and 10 business images', 400);
      }

      const updateData = {
        ...req.body,
        ...(businessImages.length > 0 && { businessImages }),
        ...(profileImage && { profileImage })
      };

      const merchant = await this.merchantService.updateProfile(req.merchant.id, updateData);
      
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

  updateEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?._id) {
        throw new AppError('Merchant not authenticated', 401);
      }

      const { newEmail } = req.body;
      if (!newEmail) {
        throw new AppError('New email is required', 400);
      }

      const merchant = await this.merchantService.updateEmail(req.user._id, newEmail);
      
      res.status(200).json({
        status: 'success',
        message: 'Email updated successfully. Please check your new email for verification.',
        data: { merchant }
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