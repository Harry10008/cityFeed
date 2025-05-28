import { Router } from 'express';
import { MerchantController } from '../controllers/merchant.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { uploadMerchantImages } from '../middleware/upload.middleware';
import { CreateMerchantDto, EmailUpdateDto, LoginMerchantDto } from '../dto/merchant.dto';

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
 *         multipart/form-data:
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
 *                 format: password
 *               businessName:
 *                 type: string
 *               category:
 *                 type: string
 *               businessImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Merchant registered successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/register', uploadMerchantImages, validate(CreateMerchantDto), merchantController.register);

/**
 * @swagger
 * /api/merchants/login:
 *   post:
 *     summary: Login merchant
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
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(LoginMerchantDto), merchantController.login);

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