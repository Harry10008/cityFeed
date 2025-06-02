import { MerchantRepository } from '../repositories/merchant.repository';
import { CreateMerchantDtoType, UpdateMerchantDtoType, LoginMerchantDtoType } from '../dto/merchant.dto';
import { AppError } from '../utils/appError';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IMerchant } from '../interfaces/merchant.interface';
import { sendVerificationEmail, generateVerificationToken } from '../utils/emailService';
import { Merchant } from '../models/merchant.model';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

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

      // Create merchant with default values
      const merchantData = {
        ...data,
        businessType: data.businessType || 'restaurant',
        role: 'merchant' as const,
        isActive: true,
        isVerified: false,
        businessAddress: {
          street: data.businessAddress.street,
          line1: data.businessAddress.line1,
          line2: data.businessAddress.line2,
          pincode: data.businessAddress.pincode
        },
        // Keep offers as string array for DTO compatibility
        offers: data.offers || []
      };

      const merchant = await this.merchantRepository.create(merchantData);
      const merchantObj = merchant.toObject();
    
      // Generate tokens
      const token = this.generateToken(merchantObj);
      const verificationToken = generateVerificationToken(merchantObj._id.toString(), merchantObj.email, merchantObj.role);
    
      // Send verification email
      try {
        await sendVerificationEmail(merchantObj.email, verificationToken);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
      }
    
      return { merchant: merchantObj, token };
    } catch (error) {
      if (error.code === 11000) {
        if (error.keyPattern?.email) {
          throw new AppError('Email already registered', 400);
        }
      }
      throw error;
    }
  }

  async login(data: LoginMerchantDtoType): Promise<{ merchant: IMerchant; token: string }> {
    try {
      // Find merchant by email
      const merchant = await this.findByEmail(data.email);
      
      if (!merchant) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check password
      const isPasswordValid = await this.verifyPassword(data.password, merchant.password);
      
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check if merchant is verified
      if (!merchant.isVerified) {
        // Generate new verification token
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
        }
        
        throw new AppError('Please verify your email to login. A new verification email has been sent.', 401);
      }

      // Generate JWT token
      const token = this.generateToken(merchant);

      return { merchant, token };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error during login', 500);
    }
  }

  async getProfile(merchantId: string): Promise<IMerchant> {
    const merchant = await this.merchantRepository.findById(merchantId);
    if (!merchant) {
      throw new AppError('Merchant not found', 404);
    }
    return merchant.toObject();
  }

  async updateProfile(merchantId: string, data: UpdateMerchantDtoType): Promise<IMerchant> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // Convert offer IDs to ObjectIds if present
    const updateData = {
      ...data,
      offers: data.offers ? data.offers.map((id: string) => new Types.ObjectId(id)) : undefined
    };
    
    const merchant = await this.merchantRepository.update(merchantId, updateData);
    if (!merchant) {
      throw new AppError('Merchant not found', 404);
    }
    return merchant.toObject();
  }

  private generateToken(merchant: IMerchant): string {
    const payload = { 
      userId: merchant._id.toString(), 
      email: merchant.email,
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
    
    return merchant.toObject();
  }

  async updateEmail(merchantId: string, newEmail: string): Promise<IMerchant> {
    const merchant = await this.merchantRepository.findById(merchantId);
    if (!merchant) {
      throw new AppError('Merchant not found', 404);
    }
    
    if (!merchant.isVerified) {
      throw new AppError('Please verify your current email before updating to a new one', 400);
    }
    
    const existingMerchant = await this.merchantRepository.findByEmail(newEmail);
    if (existingMerchant) {
      throw new AppError('Email already registered', 400);
    }

    merchant.email = newEmail;
    merchant.isVerified = false;
    await merchant.save();

    const verificationToken = generateVerificationToken(merchant._id.toString(), merchant.email, merchant.role);
    
    try {
      await sendVerificationEmail(merchant.email, verificationToken);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
    }

    return merchant.toObject();
  }

  async findByEmail(email: string): Promise<IMerchant | null> {
    try {
      const merchant = await this.merchantRepository.findByEmail(email);
      if (!merchant) return null;
      
      // If merchant is a Mongoose document, convert to plain object
      const merchantObj = merchant.toObject ? merchant.toObject() : merchant;
      
      // Ensure all required fields are present
      return {
        ...merchantObj,
        isVerified: merchantObj.isVerified ?? false,
        role: merchantObj.role || 'merchant'
      } as IMerchant;
    } catch (error) {
      console.error('Error finding merchant by email:', error);
      return null;
    }
  }

  async findById(id: string): Promise<IMerchant | null> {
    const merchant = await Merchant.findById(id).select('+password');
    if (!merchant) return null;
    return merchant as unknown as IMerchant;
  }

  async findByResetToken(token: string): Promise<IMerchant | null> {
    const merchant = await Merchant.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() }
    });
    if (!merchant) return null;
    return merchant as unknown as IMerchant;
  }

  async update(id: string, data: Partial<IMerchant>): Promise<IMerchant | null> {
    const merchant = await Merchant.findById(id);
    if (!merchant) {
      return null;
    }

    // Update fields
    Object.assign(merchant, data);
    await merchant.save();

    return merchant as unknown as IMerchant;
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async getAllMerchants(): Promise<IMerchant[]> {
    const merchants = await Merchant.find({ isActive: true });
    return merchants as unknown as IMerchant[];
  }

  async getMerchantsByCategory(category: string): Promise<IMerchant[]> {
    const merchants = await Merchant.find({
      businessType: category,
      isActive: true
    });
    return merchants as unknown as IMerchant[];
  }

  async getMerchantsByFoodPreference(preference: 'veg' | 'nonveg' | 'both'): Promise<IMerchant[]> {
    const merchants = await Merchant.find({
      foodPreference: preference,
      isActive: true
    });
    return merchants as unknown as IMerchant[];
  }

  async getMerchantsByCategoryAndFoodPreference(
    category: string,
    preference: 'veg' | 'nonveg' | 'both'
  ): Promise<IMerchant[]> {
    const merchants = await Merchant.find({
      businessType: category,
      foodPreference: preference,
      isActive: true
    });
    return merchants as unknown as IMerchant[];
  }
} 