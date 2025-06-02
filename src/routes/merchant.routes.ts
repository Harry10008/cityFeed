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
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       required:
 *         - street
 *         - line1
 *         - pincode
 *       properties:
 *         street:
 *           type: string
 *           description: Street name
 *         line1:
 *           type: string
 *           description: Primary address line
 *         line2:
 *           type: string
 *           description: Secondary address line (optional)
 *         pincode:
 *           type: string
 *           pattern: '^\d{6}$'
 *           description: 6-digit pincode
 *     Merchant:
 *       type: object
 *       required:
 *         - businessName
 *         - businessAddress
 *         - phone
 *         - email
 *         - password
 *         - businessImages
 *         - businessType
 *         - businessDescription
 *       properties:
 *         businessName:
 *           type: string
 *           minLength: 2
 *           description: Name of the business
 *         businessAddress:
 *           $ref: '#/components/schemas/Address'
 *         offers:
 *           type: array
 *           items:
 *             type: string
 *             format: objectId
 *           description: Array of offer IDs
 *         phone:
 *           type: string
 *           minLength: 10
 *           description: Phone number (minimum 10 digits)
 *         email:
 *           type: string
 *           format: email
 *           description: Merchant's email address
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Password (minimum 6 characters)
 *         businessImages:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 *           minItems: 3
 *           maxItems: 10
 *           description: Business images (3-10 images required)
 *         businessType:
 *           type: string
 *           description: Type of business (e.g., restaurant, cafe)
 *           default: restaurant
 *         businessDescription:
 *           type: string
 *           minLength: 50
 *           description: Description of the business (minimum 50 characters)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the merchant account was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the merchant account was last updated
 */

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
 *               - businessName
 *               - businessAddress
 *               - phone
 *               - email
 *               - password
 *               - businessDescription
 *               - businessImages
 *             properties:
 *               businessName:
 *                 type: string
 *                 minLength: 2
 *                 description: Name of the business
 *               businessAddress:
 *                 type: object
 *                 required:
 *                   - street
 *                   - line1
 *                   - pincode
 *                 properties:
 *                   street:
 *                     type: string
 *                     description: Street name
 *                   line1:
 *                     type: string
 *                     description: Primary address line
 *                   line2:
 *                     type: string
 *                     description: Secondary address line (optional)
 *                   pincode:
 *                     type: string
 *                     pattern: '^\d{6}$'
 *                     description: 6-digit pincode
 *               phone:
 *                 type: string
 *                 minLength: 10
 *                 description: Phone number (minimum 10 digits)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Merchant's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Password (minimum 6 characters)
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
 *               offers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of offer IDs
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
 *                       $ref: '#/components/schemas/Merchant'
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
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Login successful
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
 *                       $ref: '#/components/schemas/Merchant'
 *                     token:
 *                       type: string
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Email verified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     merchant:
 *                       $ref: '#/components/schemas/Merchant'
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
 *       - in: query
 *         name: foodPreference
 *         schema:
 *           type: string
 *           enum: [veg, nonveg, both]
 *     responses:
 *       200:
 *         description: List of merchants in the category
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
 *                     merchants:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Merchant'
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
 *                       $ref: '#/components/schemas/Merchant'
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
 *             $ref: '#/components/schemas/Merchant'
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                       $ref: '#/components/schemas/Merchant'
 */
router.patch('/profile',
  uploadBusinessImages,
  uploadProfileImage,
  validate(UpdateMerchantDto),
  merchantController.updateProfile
);

/**
 * @swagger
 * /api/merchants/email:
 *   patch:
 *     summary: Update merchant email
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
 *         description: Email updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Email updated successfully. Please check your new email for verification.
 *                 data:
 *                   type: object
 *                   properties:
 *                     merchant:
 *                       $ref: '#/components/schemas/Merchant'
 */
router.patch('/email',
  validate(UpdateMerchantDto),
  merchantController.updateEmail
);

export default router; 