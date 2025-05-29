import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { CreateAdminDto, EmailUpdateDto, LoginAdminDto, UpdateAdminDto } from '../dto/admin.dto';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../utils/emailService';
//import { validateRequest } from '../middleware/validateRequest';

const router = Router();
const adminController = new AdminController();

/**
 * @swagger
 * tags:
 *   name: Admins
 *   description: Admin management endpoints
 */

/**
 * @swagger
 * /api/admins/register:
 *   post:
 *     summary: Register a new admin
 *     tags: [Admins]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *               - phone
 *               - address
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Password (minimum 6 characters)
 *               fullName:
 *                 type: string
 *                 minLength: 2
 *                 description: Admin's full name
 *               phone:
 *                 type: string
 *                 minLength: 10
 *                 description: Phone number (minimum 10 digits)
 *               address:
 *                 type: string
 *                 minLength: 5
 *                 description: Admin's address
 *               role:
 *                 type: string
 *                 enum: [admin, super_admin]
 *                 default: admin
 *                 description: Admin role
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of admin permissions
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Whether the admin account is active
 *               isVerified:
 *                 type: boolean
 *                 default: false
 *                 description: Whether the admin email is verified
 *               profileImage:
 *                 type: string
 *                 description: URL to admin's profile image
 *     responses:
 *       201:
 *         description: Admin registered successfully
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
 *                     admin:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         role:
 *                           type: string
 *                     token:
 *                       type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Validation error
 */
router.post('/register', validate(CreateAdminDto), adminController.register);

/**
 * @swagger
 * /api/admins/login:
 *   post:
 *     summary: Login as an admin
 *     tags: [Admins]
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
router.post('/login', validate(LoginAdminDto), adminController.login);

/**
 * @swagger
 * /api/admins/verify-email:
 *   get:
 *     summary: Verify admin email
 *     tags: [Admins]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification token received in email
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
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Invalid or expired token
 */
router.get('/verify-email', adminController.verifyEmail);

/**
 * @swagger
 * /api/admins/test-email:
 *   post:
 *     summary: Test email configuration
 *     tags: [Admins]
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
 *         description: Test email sent successfully
 *       500:
 *         description: Email configuration error
 */
router.post('/test-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new AppError('Email is required', 400);
    }

    // Generate a test token
    const testToken = jwt.sign(
      { id: 'test', email, role: 'admin' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Send test email
    await sendVerificationEmail(email, testToken);

    res.status(200).json({
      status: 'success',
      message: 'Test email sent successfully. Please check your inbox.'
    });
  } catch (error) {
    next(error);
  }
});

// Protected routes
router.use(protect);
router.use(restrictTo('admin'));

/**
 * @swagger
 * /api/admins/profile:
 *   get:
 *     summary: Get admin profile
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/profile', adminController.getProfile);

/**
 * @swagger
 * /api/admins/profile:
 *   patch:
 *     summary: Update admin profile
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - phone
 *               - address
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin profile updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.patch('/profile', validate(UpdateAdminDto), adminController.updateProfile);

/**
 * @swagger
 * /api/admins/profile/email:
 *   patch:
 *     summary: Update admin email
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
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
 *         description: Admin email updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.patch('/profile/email', validate(EmailUpdateDto), adminController.updateEmail);

export default router; 