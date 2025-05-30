import { MerchantRepository } from '../repositories/merchant.repository';
import { CreateMerchantDtoType, UpdateMerchantDtoType, LoginMerchantDtoType } from '../dto/merchant.dto';
import { AppError } from '../utils/appError';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IMerchant } from '../interfaces/merchant.interface';
import { sendVerificationEmail, generateVerificationToken } from '../utils/emailService';
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

      // Create merchant with default values for required fields
      const merchantData = {
        ...data,
        businessType: data.businessType || 'restaurant',
        businessAddress: data.address,
        foodPreference: data.foodPreference || 'both',
        role: 'merchant' as const,
        isActive: true,
        isVerified: false
      };

      const merchant = await this.merchantRepository.create(merchantData);
    
      // Generate tokens
      const token = this.generateToken(merchant);
      const verificationToken = generateVerificationToken(merchant._id.toString(), merchant.email, merchant.role);
    
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
    // Find merchant by email and explicitly select password field
    const merchant = await Merchant.findOne({ email: data.email }).select('+password');
    if (!merchant) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if email is verified
    if (!merchant.isVerified) {
      // Resend verification email
      const verificationToken = generateVerificationToken(merchant._id.toString(), merchant.email, merchant.role);
      try {
        await sendVerificationEmail(merchant.email, verificationToken);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
      }
      
      throw new AppError('Please verify your email to login. A new verification email has been sent.', 401);
    }

    // Check password using the model's comparePassword method
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
      id: merchant._id.toString(), 
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

  async updateEmail(merchantId: string, newEmail: string): Promise<IMerchant> {
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

    // Update email
    merchant.email = newEmail;
    merchant.isVerified = false; // Require verification for new email
    await merchant.save();

    // Send verification email for new email
    const verificationToken = generateVerificationToken(merchant._id.toString(), merchant.email, merchant.role);
    
    try {
      await sendVerificationEmail(merchant.email, verificationToken);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
    }

    return merchant;
  }

  async findByEmail(email: string): Promise<IMerchant | null> {
    const merchant = await Merchant.findOne({ email }).select('+password');
    return merchant ? merchant.toObject() : null;
  }

  async findById(id: string): Promise<IMerchant | null> {
    const merchant = await Merchant.findById(id).select('+password');
    return merchant ? merchant.toObject() : null;
  }

  async findByResetToken(token: string): Promise<IMerchant | null> {
    const merchant = await Merchant.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() }
    });
    return merchant ? merchant.toObject() : null;
  }

  async update(id: string, data: Partial<IMerchant>): Promise<IMerchant | null> {
    const merchant = await Merchant.findById(id);
    if (!merchant) {
      return null;
    }

    // Update fields
    Object.assign(merchant, data);
    await merchant.save();

    return merchant.toObject();
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async getAllMerchants(): Promise<IMerchant[]> {
    const merchants = await Merchant.find({ isActive: true }).lean();
    return merchants as IMerchant[];
  }

  async getMerchantsByCategory(category: string): Promise<IMerchant[]> {
    const merchants = await Merchant.find({
      businessType: category,
      isActive: true
    }).lean();
    return merchants as IMerchant[];
  }

  async getMerchantsByFoodPreference(preference: 'veg' | 'nonveg' | 'both'): Promise<IMerchant[]> {
    const merchants = await Merchant.find({
      foodPreference: preference,
      isActive: true
    }).lean();
    return merchants as IMerchant[];
  }

  async getMerchantsByCategoryAndFoodPreference(
    category: string,
    preference: 'veg' | 'nonveg' | 'both'
  ): Promise<IMerchant[]> {
    const merchants = await Merchant.find({
      businessType: category,
      foodPreference: preference,
      isActive: true
    }).lean();
    return merchants as IMerchant[];
  }
} 