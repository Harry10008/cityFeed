import { CouponRedemption } from '../models/couponRedemption.model';
import { ICouponRedemption } from '../interfaces/couponRedemption.interface';
import { AppError } from '../utils/appError';

export class CouponRedemptionRepository {
  async create(data: Partial<ICouponRedemption>): Promise<ICouponRedemption> {
    try {
      const redemption = await CouponRedemption.create(data);
      return redemption;
    } catch (error) {
      throw new AppError('Error creating coupon redemption', 500);
    }
  }

  async findById(id: string): Promise<ICouponRedemption | null> {
    try {
      return await CouponRedemption.findById(id);
    } catch (error) {
      throw new AppError('Error finding coupon redemption', 500);
    }
  }

  async findByUser(userId: string): Promise<ICouponRedemption[]> {
    try {
      return await CouponRedemption.find({ user: userId });
    } catch (error) {
      throw new AppError('Error finding user redemptions', 500);
    }
  }

  async findByCoupon(couponId: string): Promise<ICouponRedemption[]> {
    try {
      return await CouponRedemption.find({ coupon: couponId });
    } catch (error) {
      throw new AppError('Error finding coupon redemptions', 500);
    }
  }

  async updateStatus(id: string, status: 'pending' | 'completed' | 'cancelled'): Promise<ICouponRedemption | null> {
    try {
      return await CouponRedemption.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
    } catch (error) {
      throw new AppError('Error updating redemption status', 500);
    }
  }

  async findByTransactionId(transactionId: string): Promise<ICouponRedemption | null> {
    try {
      return await CouponRedemption.findOne({ transactionId });
    } catch (error) {
      throw new AppError('Error finding redemption by transaction ID', 500);
    }
  }

  async getRedemptionStats(userId: string): Promise<{
    totalRedemptions: number;
    totalSavings: number;
    averageDiscount: number;
  }> {
    try {
      const redemptions = await CouponRedemption.find({
        user: userId,
        status: 'completed'
      });

      const totalRedemptions = redemptions.length;
      const totalSavings = redemptions.reduce((sum, redemption) => sum + redemption.discountAmount, 0);
      const averageDiscount = totalRedemptions > 0 ? totalSavings / totalRedemptions : 0;

      return {
        totalRedemptions,
        totalSavings,
        averageDiscount
      };
    } catch (error) {
      throw new AppError('Error getting redemption stats', 500);
    }
  }

  async getMerchantRedemptionStats(merchantId: string): Promise<{
    totalRedemptions: number;
    totalRevenue: number;
    averageTransaction: number;
  }> {
    try {
      const redemptions = await CouponRedemption.find({
        merchant: merchantId,
        status: 'completed'
      });

      const totalRedemptions = redemptions.length;
      const totalRevenue = redemptions.reduce((sum, redemption) => sum + redemption.amount, 0);
      const averageTransaction = totalRedemptions > 0 ? totalRevenue / totalRedemptions : 0;

      return {
        totalRedemptions,
        totalRevenue,
        averageTransaction
      };
    } catch (error) {
      throw new AppError('Error getting merchant redemption stats', 500);
    }
  }
} 