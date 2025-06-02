import { Router } from 'express';
import { CouponController } from '../controllers/coupon.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { CreateCouponDto, UpdateCouponDto, RedeemCouponDto } from '../dto/coupon.dto';

const router = Router();
const couponController = new CouponController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Coupon:
 *       type: object
 *       required:
 *         - code
 *         - title
 *         - description
 *         - discountPercentage
 *         - maxDiscountAmount
 *         - startDate
 *         - endDate
 *       properties:
 *         code:
 *           type: string
 *           minLength: 3
 *           description: Unique coupon code
 *         title:
 *           type: string
 *           minLength: 3
 *           description: Coupon title
 *         description:
 *           type: string
 *           minLength: 10
 *           description: Coupon description
 *         discountPercentage:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Percentage discount (0-100)
 *         maxDiscountAmount:
 *           type: number
 *           minimum: 0
 *           description: Maximum discount amount
 *         minPurchaseAmount:
 *           type: number
 *           minimum: 0
 *           description: Minimum purchase amount required
 *         maxPurchaseAmount:
 *           type: number
 *           minimum: 0
 *           description: Maximum purchase amount allowed
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: When the coupon becomes valid
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: When the coupon expires
 *         isActive:
 *           type: boolean
 *           description: Whether the coupon is currently active
 */

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
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     coupons:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Coupon'
 */
router.get('/active', couponController.getActiveCoupons);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     coupon:
 *                       $ref: '#/components/schemas/Coupon'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     coupon:
 *                       $ref: '#/components/schemas/Coupon'
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
 *             $ref: '#/components/schemas/Coupon'
 *     responses:
 *       201:
 *         description: Coupon created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     coupon:
 *                       $ref: '#/components/schemas/Coupon'
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
 *             $ref: '#/components/schemas/Coupon'
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     coupon:
 *                       $ref: '#/components/schemas/Coupon'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     coupons:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Coupon'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
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
 *                 enum: [completed, cancelled]
 *     responses:
 *       200:
 *         description: Redemption status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     redemption:
 *                       type: object
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
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Coupon redeemed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     redemption:
 *                       type: object
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/user/stats', couponController.getRedemptionStats);

export default router;