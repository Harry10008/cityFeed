import { Router } from 'express';
import { MerchantController } from '../controllers/merchant.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { CreateMerchantDto, EmailUpdateDto, LoginMerchantDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from '../dto/merchant.dto';
import { validateRequest } from '../middleware/validateRequest';
import { authenticateMerchant } from '../middleware/auth';

const router = Router();
const merchantController = new MerchantController();

/**
 * @swagger
 * tags:
 *   name: Merchants
 *   description: Merchant management endpoints
 */

/**
 * @swagger
 * /api/merchants/register:
 *   post:
 *     summary: Register a new merchant
 *     tags: [Merchants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - businessName
 *               - category
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               businessName:
 *                 type: string
 *                 minLength: 2
 *               category:
 *                 type: string
 *               businessImages:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Merchant registered successfully
 *       400:
 *         description: Validation error
 */
router.post('/register', validateRequest(CreateMerchantDto), merchantController.register);

/**
 * @swagger
 * /api/merchants/login:
 *   post:
 *     summary: Login as a merchant
 *     tags: [Merchants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validateRequest(LoginMerchantDto), merchantController.login);

/**
 * @swagger
 * /api/merchants/verify-email:
 *   get:
 *     summary: Verify merchant email
 *     tags: [Merchants]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.get('/verify-email', merchantController.verifyEmail);

/**
 * @swagger
 * /api/merchants/category/{category}:
 *   get:
 *     summary: Get merchants by category
 *     tags: [Merchants]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of merchants in the category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   businessName:
 *                     type: string
 *                   category:
 *                     type: string
 */
router.get('/category/:category', merchantController.getMerchants);

/**
 * @swagger
 * /api/merchants/forgot-password:
 *   post:
 *     tags: [Merchant]
 *     summary: Request password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: Merchant not found
 */
router.post('/forgot-password', validateRequest(ForgotPasswordDto), merchantController.forgotPassword);

/**
 * @swagger
 * /api/merchants/reset-password:
 *   post:
 *     tags: [Merchant]
 *     summary: Reset password using token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password', validateRequest(ResetPasswordDto), merchantController.resetPassword);

/**
 * @swagger
 * /api/merchants/change-password:
 *   post:
 *     tags: [Merchant]
 *     summary: Change password (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Unauthorized or incorrect current password
 */
router.post('/change-password', authenticateMerchant, validateRequest(ChangePasswordDto), merchantController.changePassword);

// Protected routes
router.use(protect);

/**
 * @swagger
 * /api/merchants/profile:
 *   get:
 *     summary: Get merchant profile
 *     tags: [Merchants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Merchant profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', merchantController.getProfile);

/**
 * @swagger
 * /api/merchants/profile/email:
 *   post:
 *     summary: Initiate email update
 *     tags: [Merchants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newEmail
 *             properties:
 *               newEmail:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email update initiated
 *       401:
 *         description: Unauthorized
 */
router.post('/profile/email', validate(EmailUpdateDto), merchantController.initiateEmailUpdate);

export default router; 