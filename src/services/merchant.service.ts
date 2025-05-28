import { MerchantRepository } from '../repositories/merchant.repository';
import { CreateMerchantDtoType, UpdateMerchantDtoType, LoginMerchantDtoType } from '../dto/merchant.dto';
import { AppError } from '../utils/appError';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IMerchant } from '../interfaces/merchant.interface';
import { sendVerificationEmail } from '../utils/emailService';
import { OTPService } from '../utils/otpService';
import { Merchant } from '../models/merchant.model';
import bcrypt from 'bcryptjs';

export class MerchantService {
  private merchantRepository: MerchantRepository;

  constructor() {
    this.merchantRepository = new MerchantRepository();
  }

  async register(data: CreateMerchantDtoType): Promise<{ merchant: IMerchant; token: string }> {
    try {
      // Check if email already exists
      const existingEmailMerchant = await Merchant.findOne({ email: data.email });
      if (existingEmailMerchant) {
        throw new AppError('Email already registered', 400);
      }

      // Create merchant
      const merchant = await this.merchantRepository.create(data);
    
      // Generate tokens
      const token = this.generateToken(merchant);
      const verificationToken = jwt.sign(
        { id: merchant._id, email: merchant.email, role: merchant.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
    
      // Send verification email
      try {
        await sendVerificationEmail(merchant.email, verificationToken);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // Don't throw error here, just log it. Merchant can request verification email later
      }
    
      return { merchant, token };
    } catch (error) {
      // Handle mongoose duplicate key error
      if (error.code === 11000) {
        if (error.keyPattern?.email) {
          throw new AppError('Email already registered', 400);
        }
      }
      throw error;
    }
  }

  async login(data: LoginMerchantDtoType): Promise<{ merchant: IMerchant; token: string }> {
    // Find merchant by email
    const merchant = await this.merchantRepository.findByEmail(data.email);
    if (!merchant) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if email is verified
    if (!merchant.isVerified) {
      // Resend verification email
      const verificationToken = jwt.sign(
        { id: merchant._id, email: merchant.email, role: merchant.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      try {
        await sendVerificationEmail(merchant.email, verificationToken);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
      }
      
      throw new AppError('Please verify your email to login. A new verification email has been sent.', 401);
    }

    // Check password
    const isPasswordValid = await merchant.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = this.generateToken(merchant);

    return { merchant, token };
  }

  async getProfile(merchantId: string): Promise<IMerchant> {
    const merchant = await this.merchantRepository.findById(merchantId);
    if (!merchant) {
      throw new AppError('Merchant not found', 404);
    }
    return merchant;
  }

  async updateProfile(merchantId: string, data: UpdateMerchantDtoType): Promise<IMerchant> {
    const merchant = await this.merchantRepository.update(merchantId, data);
    if (!merchant) {
      throw new AppError('Merchant not found', 404);
    }
    return merchant;
  }

  private generateToken(merchant: IMerchant): string {
    const payload = { 
      id: merchant._id, 
      role: merchant.role,
      isVerified: merchant.isVerified 
    };
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    const options: SignOptions = { expiresIn: '7d' };
    
    return jwt.sign(payload, secret, options);
  }

  async verifyMerchant(merchantId: string): Promise<IMerchant> {
    const merchant = await this.merchantRepository.findById(merchantId);
    if (!merchant) {
      throw new AppError('Merchant not found', 404);
    }
    
    if (merchant.isVerified) {
      throw new AppError('Email already verified', 400);
    }
    
    merchant.isVerified = true;
    await merchant.save();
    
    return merchant;
  }

  async initiateEmailUpdate(merchantId: string, newEmail: string): Promise<void> {
    // Check if merchant exists and is verified
    const merchant = await this.merchantRepository.findById(merchantId);
    if (!merchant) {
      throw new AppError('Merchant not found', 404);
    }
    
    // Check if merchant's email is verified
    if (!merchant.isVerified) {
      throw new AppError('Please verify your current email before updating to a new one', 400);
    }
    
    // Check if new email is already registered
    const existingMerchant = await this.merchantRepository.findByEmail(newEmail);
    if (existingMerchant) {
      throw new AppError('Email already registered', 400);
    }

    await OTPService.sendOTP('email', merchantId, newEmail);
  }

  async verifyAndUpdateEmail(merchantId: string, newEmail: string, otp: string): Promise<IMerchant> {
    const isValid = await OTPService.verifyOTP('email', merchantId, otp);
    if (!isValid) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    const merchant = await this.merchantRepository.update(merchantId, { email: newEmail });
    if (!merchant) {
      throw new AppError('Merchant not found', 404);
    }
    return merchant;
  }

  async create(data: CreateMerchantDtoType): Promise<IMerchant> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return Merchant.create({ ...data, password: hashedPassword });
  }

  async findByEmail(email: string): Promise<IMerchant | null> {
    return Merchant.findOne({ email }).select('+password');
  }

  async findById(id: string): Promise<IMerchant | null> {
    return Merchant.findById(id).select('+password');
  }

  async findByResetToken(token: string): Promise<IMerchant | null> {
    return Merchant.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() }
    }).select('+password');
  }

  async update(id: string, data: Partial<UpdateMerchantDtoType>): Promise<IMerchant | null> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return Merchant.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async getAllMerchants(): Promise<IMerchant[]> {
    try {
      return await Merchant.find({ isActive: true })
        .select('-password -resetToken -resetTokenExpires')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new AppError('Error fetching merchants', 500);
    }
  }

  async getMerchantsByCategory(category: string): Promise<IMerchant[]> {
    try {
      return await Merchant.find({ 
        category,
        isActive: true 
      })
        .select('-password -resetToken -resetTokenExpires')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new AppError('Error fetching merchants by category', 500);
    }
  }

  async getMerchantsByFoodPreference(foodPreference: 'veg' | 'nonveg' | 'both'): Promise<IMerchant[]> {
    try {
      // Validate food preference
      if (!['veg', 'nonveg', 'both'].includes(foodPreference)) {
        throw new AppError('Invalid food preference', 400);
      }

      return await Merchant.find({ 
        foodPreference,
        isActive: true 
      })
        .select('-password -resetToken -resetTokenExpires')
        .sort({ createdAt: -1 });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error fetching merchants by food preference', 500);
    }
  }

  async getMerchantsByCategoryAndFoodPreference(
    category: string,
    foodPreference: 'veg' | 'nonveg' | 'both'
  ): Promise<IMerchant[]> {
    try {
      // Validate food preference
      if (!['veg', 'nonveg', 'both'].includes(foodPreference)) {
        throw new AppError('Invalid food preference', 400);
      }

      return await Merchant.find({ 
        category,
        foodPreference,
        isActive: true 
      })
        .select('-password -resetToken -resetTokenExpires')
        .sort({ createdAt: -1 });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error fetching merchants by category and food preference', 500);
    }
  }
} 