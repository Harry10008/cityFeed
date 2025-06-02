import { CouponRepository } from '../repositories/coupon.repository';
import { CreateCouponDtoType, UpdateCouponDtoType, RedeemCouponDtoType } from '../dto/coupon.dto';
import { AppError } from '../utils/appError';
import { ICoupon } from '../interfaces/coupon.interface';
import { ICouponRedemption } from '../interfaces/couponRedemption.interface';
import { Types } from 'mongoose';

export class CouponService {
  private couponRepository: CouponRepository;

  constructor() {
    this.couponRepository = new CouponRepository();
  }

  async createCoupon(data: CreateCouponDtoType, merchantId: string): Promise<ICoupon> {
    const coupon = await this.couponRepository.create({
      ...data,
      merchant: new Types.ObjectId(merchantId),
      isActive: true
    });
    return coupon;
  }

  async updateCoupon(id: string, data: UpdateCouponDtoType): Promise<ICoupon> {
    const coupon = await this.couponRepository.update(id, data);
    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }
    return coupon;
  }

  async getCoupon(id: string): Promise<ICoupon> {
    const coupon = await this.couponRepository.findById(id);
    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }
    return coupon;
  }

  async getCouponByCode(code: string): Promise<ICoupon> {
    const coupon = await this.couponRepository.findByCode(code);
    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }
    return coupon;
  }

  async getMerchantCoupons(merchantId: string): Promise<ICoupon[]> {
    return await this.couponRepository.findByMerchant(merchantId);
  }

  async getActiveCoupons(): Promise<ICoupon[]> {
    return await this.couponRepository.findActive();
  }

  async getCouponsByCategory(category: string): Promise<ICoupon[]> {
    return await this.couponRepository.findByCategory(category);
  }

  async redeemCoupon(couponId: string, userId: string, data: RedeemCouponDtoType): Promise<ICouponRedemption> {
    const coupon = await this.getCoupon(couponId);
    const now = new Date();

    // Check if coupon is valid
    if (now < coupon.startDate || now > coupon.endDate) {
      throw new AppError('Coupon is not valid at this time', 400);
    }

    // Check minimum purchase amount
    if (coupon.minPurchaseAmount && data.amount < coupon.minPurchaseAmount) {
      throw new AppError(`Minimum purchase amount is ${coupon.minPurchaseAmount}`, 400);
    }

    // Check maximum purchase amount
    if (coupon.maxPurchaseAmount && data.amount > coupon.maxPurchaseAmount) {
      throw new AppError(`Maximum purchase amount is ${coupon.maxPurchaseAmount}`, 400);
    }

    // Calculate discount amount
    let discountAmount = (data.amount * coupon.discountPercentage) / 100;
    if (discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }

    // Create redemption record
    const redemption = await this.couponRepository.createRedemption({
      user: new Types.ObjectId(userId),
      coupon: new Types.ObjectId(couponId),
      amount: data.amount,
      discountAmount,
      status: 'pending',
      redeemedAt: now
    });

    return redemption;
  }

  async updateRedemptionStatus(id: string, status: 'completed' | 'cancelled'): Promise<ICouponRedemption> {
    const redemption = await this.couponRepository.updateRedemptionStatus(id, status);
    if (!redemption) {
      throw new AppError('Redemption not found', 404);
    }
    return redemption;
  }

  async getRedemptionStats(userId: string): Promise<any> {
    return await this.couponRepository.getUserRedemptionStats(userId);
  }

  async getMerchantRedemptionStats(merchantId: string): Promise<any> {
    return await this.couponRepository.getMerchantRedemptionStats(merchantId);
  }
} 