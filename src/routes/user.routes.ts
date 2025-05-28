import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { uploadUserProfileImage, updateUserProfileImage } from '../middleware/upload.middleware';
import { 
  CreateUserDto, 
  LoginUserDto, 
  UpdateUserDto, 
  ForgotPasswordDto, 
  ResetPasswordDto, 
  ChangePasswordDto 
} from '../dto/user.dto';
//import { rateLimit } from '../middleware/rateLimit';

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - phone
 *               - address
 *               - gender
 *               - dob
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: User's full name (minimum 2 characters)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password (minimum 6 characters)
 *               phone:
 *                 type: string
 *                 description: Phone number (minimum 10 characters)
 *               address:
 *                 type: string
 *                 description: User's address (minimum 5 characters)
 *               gender:
 *                 type: string
 *                 enum: [M, F, 0]
 *                 description: User's gender (M for Male, F for Female, 0 for Other)
 *               dob:
 *                 type: string
 *                 description: Date of birth in dd/mm/yyyy format
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: User's profile image (optional)
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 */
router.post('/register', uploadUserProfileImage, validate(CreateUserDto), userController.register);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
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
router.post('/login', validate(LoginUserDto), userController.login);

/**
 * @swagger
 * /api/users/verify-email:
 *   get:
 *     summary: Verify user email
 *     tags: [Users]
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
router.get('/verify-email', userController.verifyEmail);

/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Users]
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
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *       404:
 *         description: User not found
 */
router.post('/forgot-password', validate(ForgotPasswordDto), userController.forgotPassword);

/**
 * @swagger
 * /api/users/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Users]
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
 *                 description: Password reset token received via email
 *               password:
 *                 type: string
 *                 format: password
 *                 description: New password (minimum 6 characters)
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password', validate(ResetPasswordDto), userController.resetPassword);

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Change password using current password
 *     tags: [Users]
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
 *                 format: password
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password (minimum 6 characters)
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Unauthorized - Invalid current password
 */
router.post('/change-password', protect, validate(ChangePasswordDto), userController.changePassword);

// Protected routes
router.use(protect);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', userController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.patch('/profile', updateUserProfileImage, validate(UpdateUserDto), userController.updateProfile);
router.patch('/profile/membership', userController.updateMembershipType);
router.patch('/profile/image', updateUserProfileImage, userController.updateProfileImage);

// Email update routes (with rate limiting)
router.post(
  '/profile/email/initiate',
  //rateLimit({ windowMs: 15 * 60 * 1000, max: 3 }), // 3 attempts per 15 minutes
  userController.initiateEmailUpdate
);
router.post(
  '/profile/email/verify',
  //rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 attempts per 15 minutes
  userController.verifyAndUpdateEmail
);

// Phone update routes (with rate limiting)
router.post(
  '/profile/phone/initiate',
  // rateLimit({ windowMs: 15 * 60 * 1000, max: 3 }), // 3 attempts per 15 minutes
  userController.initiateMobileUpdate
);
router.post(
  '/profile/phone/verify',
  //rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 attempts per 15 minutes
  userController.verifyAndUpdateMobile
);

export default router; 