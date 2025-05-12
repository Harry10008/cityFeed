import { Coupon } from '../models/coupon.model';
import { CouponRedemption } from '../models/couponRedemption.model';
import { ICoupon } from '../interfaces/coupon.interface';
import { ICouponRedemption } from '../interfaces/couponRedemption.interface';
import { CreateCouponDtoType, UpdateCouponDtoType } from '../dto/coupon.dto';
import { AppError } from '../utils/appError';
import { Types } from 'mongoose';

export class CouponRepository {
  async create(data: CreateCouponDtoType & { merchant: Types.ObjectId; currentRedemptions: number; isActive: boolean }): Promise<ICoupon> {
    try {
      const coupon = await Coupon.create(data);
      return coupon.toObject() as ICoupon;
    } catch (error) {
      throw new AppError('Error creating coupon', 500);
    }
  }

  async findById(id: string): Promise<ICoupon | null> {
    try {
      const coupon = await Coupon.findById(id);
      return coupon ? (coupon.toObject() as ICoupon) : null;
    } catch (error) {
      throw new AppError('Error finding coupon', 500);
    }
  }

  async findByCode(code: string): Promise<ICoupon | null> {
    try {
      const coupon = await Coupon.findOne({ code });
      return coupon ? (coupon.toObject() as ICoupon) : null;
    } catch (error) {
      throw new AppError('Error finding coupon', 500);
    }
  }

  async update(id: string, data: UpdateCouponDtoType): Promise<ICoupon | null> {
    try {
      const coupon = await Coupon.findByIdAndUpdate(id, data, { new: true });
      return coupon ? (coupon.toObject() as ICoupon) : null;
    } catch (error) {
      throw new AppError('Error updating coupon', 500);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await Coupon.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new AppError('Error deleting coupon', 500);
    }
  }

  async findAll(): Promise<ICoupon[]> {
    try {
      const coupons = await Coupon.find();
      return coupons.map(coupon => coupon.toObject() as ICoupon);
    } catch (error) {
      throw new AppError('Error finding coupons', 500);
    }
  }

  async findByMerchant(merchantId: string): Promise<ICoupon[]> {
    try {
      const coupons = await Coupon.find({ merchant: merchantId });
      return coupons.map(coupon => coupon.toObject() as ICoupon);
    } catch (error) {
      throw new AppError('Error finding merchant coupons', 500);
    }
  }

  async findByCategory(category: string): Promise<ICoupon[]> {
    try {
      const coupons = await Coupon.find({ category });
      return coupons.map(coupon => coupon.toObject() as ICoupon);
    } catch (error) {
      throw new AppError('Error finding coupons by category', 500);
    }
  }

  async findActive(): Promise<ICoupon[]> {
    try {
      const now = new Date();
      const coupons = await Coupon.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      });
      return coupons.map(coupon => coupon.toObject() as ICoupon);
    } catch (error) {
      throw new AppError('Error finding active coupons', 500);
    }
  }

  async createRedemption(data: {
    user: Types.ObjectId;
    coupon: Types.ObjectId;
    amount: number;
    discountAmount: number;
    status: 'pending' | 'completed' | 'cancelled';
    redeemedAt: Date;
  }): Promise<ICouponRedemption> {
    try {
      const redemption = await CouponRedemption.create(data);
      return redemption.toObject() as ICouponRedemption;
    } catch (error) {
      throw new AppError('Error creating redemption', 500);
    }
  }

  async updateRedemptionStatus(id: string, status: 'completed' | 'cancelled'): Promise<ICouponRedemption | null> {
    try {
      const updateData: any = { status };
      if (status === 'completed') {
        updateData.completedAt = new Date();
      } else if (status === 'cancelled') {
        updateData.cancelledAt = new Date();
      }
      const redemption = await CouponRedemption.findByIdAndUpdate(id, updateData, { new: true });
      return redemption ? (redemption.toObject() as ICouponRedemption) : null;
    } catch (error) {
      throw new AppError('Error updating redemption status', 500);
    }
  }

  async incrementRedemptions(couponId: string): Promise<void> {
    try {
      await Coupon.findByIdAndUpdate(couponId, { $inc: { currentRedemptions: 1 } });
    } catch (error) {
      throw new AppError('Error incrementing redemptions', 500);
    }
  }

  async getUserRedemptionStats(userId: string): Promise<any> {
    try {
      return await CouponRedemption.aggregate([
        { $match: { user: new Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            totalDiscount: { $sum: '$discountAmount' }
          }
        }
      ]);
    } catch (error) {
      throw new AppError('Error getting user redemption stats', 500);
    }
  }

  async getMerchantRedemptionStats(merchantId: string): Promise<any> {
    try {
      return await CouponRedemption.aggregate([
        {
          $lookup: {
            from: 'coupons',
            localField: 'coupon',
            foreignField: '_id',
            as: 'coupon'
          }
        },
        { $unwind: '$coupon' },
        { $match: { 'coupon.merchant': new Types.ObjectId(merchantId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            totalDiscount: { $sum: '$discountAmount' }
          }
        }
      ]);
    } catch (error) {
      throw new AppError('Error getting merchant redemption stats', 500);
    }
  }
} 