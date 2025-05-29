import { Request, Response, NextFunction } from 'express';
import { MerchantService } from '../services/merchant.service';
import { EmailUpdateDto, VerifyEmailDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto, LoginMerchantDto } from '../dto/merchant.dto';
import { verifyToken } from '../utils/emailService';
import { AppError } from '../utils/appError';
import { AuthRequest } from '../middleware/auth';
import { config } from '../config';
import { sendEmail } from '../utils/email';
import crypto from 'crypto';

export class MerchantController {
  private merchantService: MerchantService;

  constructor() {
    this.merchantService = new MerchantService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate number of images
      if (!req.body.businessImages || req.body.businessImages.length < 3 || req.body.businessImages.length > 10) {
        throw new AppError('You must provide between 3 and 10 business images', 400);
      }

      const { merchant, token } = await this.merchantService.register(req.body);
      
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

  initiateEmailUpdate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.merchant?._id) {
        throw new AppError('Not authenticated', 401);
      }

      const { newEmail } = EmailUpdateDto.parse(req.body);
      
      await this.merchantService.initiateEmailUpdate(req.merchant._id.toString(), newEmail);
      
      res.status(200).json({
        status: 'success',
        message: 'OTP sent to new email address. Please check your email and verify within 10 minutes.'
      });
    } catch (error) {
      next(error);
    }
  };
  
  verifyAndUpdateEmail = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.merchant?._id) {
        throw new AppError('Not authenticated', 401);
      }

      const { token } = VerifyEmailDto.parse(req.body);
      const { newEmail } = EmailUpdateDto.parse(req.body);
      
      const merchant = await this.merchantService.verifyAndUpdateEmail(
        req.merchant._id.toString(),
        newEmail,
        token
      );
      
      res.status(200).json({
        status: 'success',
        message: 'Email updated successfully',
        data: {
          merchant
        }
      });
    } catch (error) {
      next(error);
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

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = ForgotPasswordDto.parse(req.body);
      const merchant = await this.merchantService.findByEmail(email);

      if (!merchant) {
        throw new AppError('Merchant not found', 404);
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Save hashed token to merchant
      await this.merchantService.update(merchant._id.toString(), {
        resetToken: hashedToken,
        resetTokenExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      });

      // Send reset email
      const resetUrl = `${config.clientUrl}/merchant/reset-password?token=${resetToken}`;
      await sendEmail({
        email: merchant.email,
        subject: 'Merchant Password Reset Request',
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

      // Find merchant with valid reset token
      const merchant = await this.merchantService.findByResetToken(hashedToken);

      if (!merchant || !merchant.resetTokenExpires || merchant.resetTokenExpires < new Date()) {
        throw new AppError('Invalid or expired reset token', 400);
      }

      // Update password and clear reset token
      await this.merchantService.update(merchant._id.toString(), {
        resetToken: undefined,
        resetTokenExpires: undefined
      });

      // Update password separately using the model's pre-save hook
      merchant.password = password;
      await merchant.save();

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
      if (!req.merchant?._id) {
        throw new AppError('Not authenticated', 401);
      }

      const { currentPassword, newPassword } = ChangePasswordDto.parse(req.body);

      const merchant = await this.merchantService.findById(req.merchant._id.toString());
      if (!merchant) {
        throw new AppError('Merchant not found', 404);
      }

      // Verify current password
      const isPasswordValid = await this.merchantService.verifyPassword(currentPassword, merchant.password);
      if (!isPasswordValid) {
        throw new AppError('Current password is incorrect', 401);
      }

      // Update password using the model's pre-save hook
      merchant.password = newPassword;
      await merchant.save();

      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  };
} 