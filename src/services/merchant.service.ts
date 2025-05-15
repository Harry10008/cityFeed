import { MerchantRepository } from '../repositories/merchant.repository';
import { CreateMerchantDtoType, UpdateMerchantDtoType } from '../dto/merchant.dto';
import { AppError } from '../utils/appError';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IMerchant } from '../interfaces/merchant.interface';
import { generateVerificationToken, sendVerificationEmail } from '../utils/emailService';
import { OTPService } from '../utils/otpService';

export class MerchantService {
  private merchantRepository: MerchantRepository;

  constructor() {
    this.merchantRepository = new MerchantRepository();
  }

  async register(data: CreateMerchantDtoType): Promise<{ merchant: IMerchant; token: string }> {
    // Check if merchant already exists
    const existingMerchant = await this.merchantRepository.findByEmail(data.email);
    if (existingMerchant) {
      throw new AppError('Email already registered', 400);
    }

    // Create new merchant
    const merchant = await this.merchantRepository.create(data);

    // Generate JWT token
    const token = this.generateToken(merchant);

    // Send verification email
    const verificationToken = generateVerificationToken(merchant._id.toString(), merchant.role);
    await sendVerificationEmail(merchant.email, verificationToken, merchant.role);

    return { merchant, token };
  }

  async login(data: { email: string; password: string }): Promise<{ merchant: IMerchant; token: string }> {
    // Find merchant by email
    const merchant = await this.merchantRepository.findByEmail(data.email);
    if (!merchant) {
      throw new AppError('Invalid credentials', 401);
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

  async verifyMerchant(merchantId: string): Promise<IMerchant> {
    const merchant = await this.merchantRepository.findById(merchantId);
    if (!merchant) {
      throw new AppError('Merchant not found', 404);
    }

    if (merchant.isVerified) {
      throw new AppError('Merchant is already verified', 400);
    }

    merchant.isVerified = true;
    await merchant.save();
    
    return merchant;
  }

  async initiateEmailUpdate(merchantId: string, newEmail: string): Promise<void> {
    // Check if merchant exists
    const merchant = await this.merchantRepository.findById(merchantId);
    if (!merchant) {
      throw new AppError('Merchant not found', 404);
    }

    // Check if new email is already registered
    const existingMerchant = await this.merchantRepository.findByEmail(newEmail);
    if (existingMerchant) {
      throw new AppError('Email already registered', 400);
    }

    // Send OTP to the new email
    await OTPService.sendOTP('email', merchantId, newEmail);
  }

  async verifyAndUpdateEmail(merchantId: string, newEmail: string, otp: string): Promise<IMerchant> {
    // Check if merchant exists
    const merchant = await this.merchantRepository.findById(merchantId);
    if (!merchant) {
      throw new AppError('Merchant not found', 404);
    }

    // Verify OTP
    const isValid = await OTPService.verifyOTP('email', merchantId, otp);
    if (!isValid) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    // Update email
    const updatedMerchant = await this.merchantRepository.update(merchantId, { email: newEmail });
    if (!updatedMerchant) {
      throw new AppError('Failed to update email', 500);
    }

    return updatedMerchant;
  }

  async updateVerificationStatus(merchantId: string, isVerified: boolean): Promise<IMerchant> {
    const merchant = await this.merchantRepository.updateVerificationStatus(merchantId, isVerified);
    if (!merchant) {
      throw new AppError('Merchant not found', 404);
    }
    return merchant;
  }

  async getAllMerchants(): Promise<IMerchant[]> {
    return await this.merchantRepository.findAll();
  }

  async getMerchantsByCategory(category: string): Promise<IMerchant[]> {
    return await this.merchantRepository.findByCategory(category);
  }

  async getMerchantsByFoodPreference(foodPreference: 'veg' | 'nonveg' | 'both'): Promise<IMerchant[]> {
    // Validate food preference
    if (!['veg', 'nonveg', 'both'].includes(foodPreference)) {
      throw new AppError('Invalid food preference', 400);
    }
    
    return await this.merchantRepository.findByFoodPreference(foodPreference);
  }

  async getMerchantsByCategoryAndFoodPreference(
    category: string, 
    foodPreference: 'veg' | 'nonveg' | 'both'
  ): Promise<IMerchant[]> {
    // Validate food preference
    if (!['veg', 'nonveg', 'both'].includes(foodPreference)) {
      throw new AppError('Invalid food preference', 400);
    }
    
    return await this.merchantRepository.findByCategoryAndFoodPreference(category, foodPreference);
  }

  private generateToken(merchant: IMerchant): string {
    const payload = { id: merchant._id, role: merchant.role };
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    const options: SignOptions = { expiresIn: '7d' };
    
    return jwt.sign(payload, secret, options);
  }
} 