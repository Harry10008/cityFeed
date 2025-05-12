import { MerchantRepository } from '../repositories/merchant.repository';
import { CreateMerchantDtoType, UpdateMerchantDtoType } from '../dto/merchant.dto';
import { AppError } from '../utils/appError';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IMerchant } from '../interfaces/merchant.interface';

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

  async updateVerificationStatus(merchantId: string, isVerified: boolean): Promise<IMerchant> {
    const merchant = await this.merchantRepository.updateVerificationStatus(merchantId, isVerified);
    if (!merchant) {
      throw new AppError('Merchant not found', 404);
    }
    return merchant;
  }

  async getMerchantsByCategory(category: string): Promise<IMerchant[]> {
    return await this.merchantRepository.findByCategory(category);
  }

  private generateToken(merchant: IMerchant): string {
    const payload = { id: merchant._id, role: merchant.role };
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    const options: SignOptions = { expiresIn: '7d' };
    
    return jwt.sign(payload, secret, options);
  }
} 