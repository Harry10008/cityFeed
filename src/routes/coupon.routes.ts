import { Router } from 'express';
import { CouponController } from '../controllers/coupon.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { CreateCouponDto, UpdateCouponDto, RedeemCouponDto } from '../dto/coupon.dto';

const router = Router();
const couponController = new CouponController();

// Public routes
router.get('/active', couponController.getActiveCoupons);
router.get('/category/:category', couponController.getCouponsByCategory);
router.get('/code/:code', couponController.getCouponByCode);
router.get('/:id', couponController.getCoupon);

// Protected routes
router.use(protect);

// Merchant routes
router.post('/', validate(CreateCouponDto), couponController.createCoupon);
router.patch('/:id', validate(UpdateCouponDto), couponController.updateCoupon);
router.get('/merchant/coupons', couponController.getMerchantCoupons);
router.get('/merchant/stats', couponController.getMerchantRedemptionStats);
router.patch('/redemption/:id/status', couponController.updateRedemptionStatus);

// User routes
router.post('/:id/redeem', validate(RedeemCouponDto), couponController.redeemCoupon);
router.get('/user/stats', couponController.getRedemptionStats);

export default router; 