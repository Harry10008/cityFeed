import { Request, Response, NextFunction } from 'express';
import { CouponService } from '../services/coupon.service';
import { CreateCouponDto, UpdateCouponDto, RedeemCouponDto } from '../dto/coupon.dto';
import { AppError } from '../utils/appError';
import { AuthRequest } from '../middleware/auth';

export class CouponController {
  private couponService: CouponService;

  constructor() {
    this.couponService = new CouponService();
  }

  createCoupon = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.merchant?._id) {
        throw new AppError('Not authorized to create coupons', 401);
      }

      const couponData = CreateCouponDto.parse(req.body);
      const coupon = await this.couponService.createCoupon(couponData, req.merchant._id.toString());
      
      res.status(201).json({
        status: 'success',
        data: {
          coupon
        }
      });
    } catch (error) {
      next(error);
    }
  };

  updateCoupon = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.merchant?._id) {
        throw new AppError('Not authorized to update coupons', 401);
      }

      const { id } = req.params;
      const updateData = UpdateCouponDto.parse(req.body);
      const coupon = await this.couponService.updateCoupon(id, updateData, req.merchant._id.toString());
      
      res.status(200).json({
        status: 'success',
        data: {
          coupon
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const coupon = await this.couponService.getCoupon(id);
      
      res.status(200).json({
        status: 'success',
        data: {
          coupon
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getCouponByCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.params;
      const coupon = await this.couponService.getCouponByCode(code);
      
      res.status(200).json({
        status: 'success',
        data: {
          coupon
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getMerchantCoupons = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.merchant?._id) {
        throw new AppError('Not authorized to view merchant coupons', 401);
      }

      const coupons = await this.couponService.getMerchantCoupons(req.merchant._id.toString());
      
      res.status(200).json({
        status: 'success',
        data: {
          coupons
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getActiveCoupons = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const coupons = await this.couponService.getActiveCoupons();
      
      res.status(200).json({
        status: 'success',
        data: {
          coupons
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getCouponsByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category } = req.params;
      const coupons = await this.couponService.getCouponsByCategory(category);
      
      res.status(200).json({
        status: 'success',
        data: {
          coupons
        }
      });
    } catch (error) {
      next(error);
    }
  };

  redeemCoupon = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?._id) {
        throw new AppError('Not authorized to redeem coupons', 401);
      }

      const { id } = req.params;
      const redeemData = RedeemCouponDto.parse(req.body);
      const redemption = await this.couponService.redeemCoupon(id, req.user._id.toString(), redeemData);
      
      res.status(200).json({
        status: 'success',
        data: {
          redemption
        }
      });
    } catch (error) {
      next(error);
    }
  };

  updateRedemptionStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.merchant?._id) {
        throw new AppError('Not authorized to update redemption status', 401);
      }

      const { id } = req.params;
      const { status } = req.body;
      
      if (!['completed', 'cancelled'].includes(status)) {
        throw new AppError('Invalid status', 400);
      }

      const redemption = await this.couponService.updateRedemptionStatus(id, status, req.merchant._id.toString());
      
      res.status(200).json({
        status: 'success',
        data: {
          redemption
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getRedemptionStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?._id) {
        throw new AppError('Not authorized to view redemption stats', 401);
      }

      const stats = await this.couponService.getRedemptionStats(req.user._id.toString());
      
      res.status(200).json({
        status: 'success',
        data: {
          stats
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getMerchantRedemptionStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.merchant?._id) {
        throw new AppError('Not authorized to view merchant redemption stats', 401);
      }

      const stats = await this.couponService.getMerchantRedemptionStats(req.merchant._id.toString());
      
      res.status(200).json({
        status: 'success',
        data: {
          stats
        }
      });
    } catch (error) {
      next(error);
    }
  };
} 