import { Router } from 'express';
import { MerchantController } from '../controllers/merchant.controller';
import { validate } from '../middleware/validate';
import { CreateMerchantDto, LoginMerchantDto, UpdateMerchantDto } from '../dto/merchant.dto';
import { authenticateMerchant } from '../middleware/auth';
import { uploadBusinessImages, uploadProfileImage } from '../middleware/upload';

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
 *               - fullName
 *               - phone
 *               - address
 *               - businessName
 *               - businessDescription
 *               - businessImages
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Merchant's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Password (minimum 6 characters)
 *               fullName:
 *                 type: string
 *                 minLength: 2
 *                 description: Merchant's full name
 *               phone:
 *                 type: string
 *                 minLength: 10
 *                 description: Phone number (minimum 10 digits)
 *               address:
 *                 type: string
 *                 minLength: 5
 *                 description: Merchant's address
 *               businessName:
 *                 type: string
 *                 description: Name of the business
 *               businessDescription:
 *                 type: string
 *                 minLength: 50
 *                 description: Description of the business (minimum 50 characters)
 *               businessImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 minItems: 3
 *                 maxItems: 10
 *                 description: Business images (3-10 images required)
 *               businessType:
 *                 type: string
 *                 description: Type of business (e.g., restaurant, cafe)
 *                 default: restaurant
 *               foodPreference:
 *                 type: string
 *                 enum: [veg, nonveg, both]
 *                 description: Food preference of the business
 *                 default: both
 *     responses:
 *       201:
 *         description: Merchant registered successfully
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
 *                     merchant:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         businessName:
 *                           type: string
 *                         businessImages:
 *                           type: array
 *                           items:
 *                             type: string
 *                     token:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: Registration successful. Please check your email to verify your account.
 *       400:
 *         description: Validation error
 */
router.post('/register', 
  uploadBusinessImages,
  validate(CreateMerchantDto),
  merchantController.register
);

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
router.post('/login', 
  validate(LoginMerchantDto),
  merchantController.login
);

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
router.use(authenticateMerchant);

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
 */
router.get('/profile', merchantController.getProfile);

/**
 * @swagger
 * /api/merchants/profile:
 *   patch:
 *     summary: Update merchant profile
 *     tags: [Merchants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               businessName:
 *                 type: string
 *               businessDescription:
 *                 type: string
 *               businessImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.patch('/profile',
  uploadBusinessImages,
  uploadProfileImage,
  validate(UpdateMerchantDto),
  merchantController.updateProfile
);

router.patch('/email',
  validate(UpdateMerchantDto),
  merchantController.updateEmail
);

export default router; 