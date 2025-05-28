import { Router } from 'express';
import { CouponController } from '../controllers/coupon.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { CreateCouponDto, UpdateCouponDto, RedeemCouponDto } from '../dto/coupon.dto';

const router = Router();
const couponController = new CouponController();

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupon management endpoints
 */

/**
 * @swagger
 * /api/coupons/active:
 *   get:
 *     summary: Get all active coupons
 *     tags: [Coupons]
 *     responses:
 *       200:
 *         description: List of active coupons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   code:
 *                     type: string
 *                   discount:
 *                     type: number
 *                   expiryDate:
 *                     type: string
 *                     format: date-time
 */
router.get('/active', couponController.getActiveCoupons);

/**
 * @swagger
 * /api/coupons/category/{category}:
 *   get:
 *     summary: Get coupons by category
 *     tags: [Coupons]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of coupons in the category
 */
router.get('/category/:category', couponController.getCouponsByCategory);

/**
 * @swagger
 * /api/coupons/code/{code}:
 *   get:
 *     summary: Get coupon by code
 *     tags: [Coupons]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coupon details
 *       404:
 *         description: Coupon not found
 */
router.get('/code/:code', couponController.getCouponByCode);

/**
 * @swagger
 * /api/coupons/{id}:
 *   get:
 *     summary: Get coupon by ID
 *     tags: [Coupons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coupon details
 *       404:
 *         description: Coupon not found
 */
router.get('/:id', couponController.getCoupon);

// Protected routes
router.use(protect);

/**
 * @swagger
 * /api/coupons:
 *   post:
 *     summary: Create a new coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discount
 *               - expiryDate
 *             properties:
 *               code:
 *                 type: string
 *               discount:
 *                 type: number
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Coupon created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', validate(CreateCouponDto), couponController.createCoupon);

/**
 * @swagger
 * /api/coupons/{id}:
 *   patch:
 *     summary: Update a coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               discount:
 *                 type: number
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Coupon not found
 */
router.patch('/:id', validate(UpdateCouponDto), couponController.updateCoupon);

/**
 * @swagger
 * /api/coupons/merchant/coupons:
 *   get:
 *     summary: Get merchant's coupons
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of merchant's coupons
 *       401:
 *         description: Unauthorized
 */
router.get('/merchant/coupons', couponController.getMerchantCoupons);

/**
 * @swagger
 * /api/coupons/merchant/stats:
 *   get:
 *     summary: Get merchant's coupon redemption statistics
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Merchant's coupon redemption statistics
 *       401:
 *         description: Unauthorized
 */
router.get('/merchant/stats', couponController.getMerchantRedemptionStats);

/**
 * @swagger
 * /api/coupons/redemption/{id}/status:
 *   patch:
 *     summary: Update coupon redemption status
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: Redemption status updated successfully
 *       401:
 *         description: Unauthorized
 */
router.patch('/redemption/:id/status', couponController.updateRedemptionStatus);

/**
 * @swagger
 * /api/coupons/{id}/redeem:
 *   post:
 *     summary: Redeem a coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Coupon redeemed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Coupon not found
 */
router.post('/:id/redeem', validate(RedeemCouponDto), couponController.redeemCoupon);

/**
 * @swagger
 * /api/coupons/user/stats:
 *   get:
 *     summary: Get user's coupon redemption statistics
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's coupon redemption statistics
 *       401:
 *         description: Unauthorized
 */
router.get('/user/stats', couponController.getRedemptionStats);

export default router; 