import { IMerchant } from '../interfaces/merchant.interface';
import { Merchant } from '../models/merchant.model';
import { CreateMerchantDtoType } from '../dto/merchant.dto';
import { AppError } from '../utils/appError';

export class MerchantRepository {
  async create(data: CreateMerchantDtoType): Promise<IMerchant> {
    try {
      const merchant = new Merchant({
        ...data,
        businessType: data.businessType || 'restaurant',
        businessAddress: data.address,
        foodPreference: data.foodPreference || 'both',
        role: 'merchant' as const,
        isActive: true,
        isVerified: false,
        businessImages: data.businessImages || []
      });

      return await merchant.save();
    } catch (error) {
      console.error('Error creating merchant:', error);
      if (error.code === 11000) {
        throw new AppError('Email already registered', 400);
      }
      throw new AppError('Error creating merchant', 500);
    }
  }

  async findById(id: string): Promise<IMerchant | null> {
    try {
      return await Merchant.findById(id);
    } catch (error) {
      throw new AppError('Error finding merchant', 500);
    }
  }

  async findByEmail(email: string): Promise<IMerchant | null> {
    try {
      return await Merchant.findOne({ email }).select('+password');
    } catch (error) {
      throw new AppError('Error finding merchant by email', 500);
    }
  }

  async update(id: string, data: Partial<IMerchant>): Promise<IMerchant | null> {
    try {
      const merchant = await Merchant.findById(id);
      if (!merchant) {
        return null;
      }

      // Update fields
      Object.assign(merchant, data);
      return await merchant.save();
    } catch (error) {
      throw new AppError('Error updating merchant', 500);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await Merchant.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new AppError('Error deleting merchant', 500);
    }
  }

  async findAll(): Promise<IMerchant[]> {
    try {
      return await Merchant.find({ isVerified: true });
    } catch (error) {
      throw new AppError('Error finding merchants', 500);
    }
  }

  async findByCategory(category: string): Promise<IMerchant[]> {
    try {
      return await Merchant.find({ 
        businessType: category,
        isVerified: true 
      });
    } catch (error) {
      throw new AppError('Error finding merchants by category', 500);
    }
  }
  
  async findByCategoryAndFoodPreference(
    category: string, 
    foodPreference: 'veg' | 'nonveg' | 'both'
  ): Promise<IMerchant[]> {
    try {
      return await Merchant.find({ 
        businessType: category,
        foodPreference,
        isVerified: true
      });
    } catch (error) {
      throw new AppError('Error finding merchants by category and food preference', 500);
    }
  }
  
  async findByFoodPreference(foodPreference: 'veg' | 'nonveg' | 'both'): Promise<IMerchant[]> {
    try {
      return await Merchant.find({ 
        foodPreference,
        isVerified: true
      });
    } catch (error) {
      throw new AppError('Error finding merchants by food preference', 500);
    }
  }

  async updateVerificationStatus(id: string, isVerified: boolean): Promise<IMerchant | null> {
    try {
      const merchant = await Merchant.findById(id);
      if (!merchant) {
        return null;
      }

      merchant.isVerified = isVerified;
      return await merchant.save();
    } catch (error) {
      throw new AppError('Error updating merchant verification status', 500);
    }
  }
} 