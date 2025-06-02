import express from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateUser } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { uploadProfileImage } from '../middleware/upload';
import { 
  CreateUserDto, 
  UpdateUserDto, 
  LoginUserDto,
  EmailUpdateDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto
} from '../dto/user.dto';
import multer from 'multer';

const router = express.Router();
const userController = new UserController();
const upload = multer({ dest: 'uploads/' });

/**
 * @swagger
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       required:
 *         - street
 *         - city
 *         - pinCode
 *       properties:
 *         street:
 *           type: string
 *           description: Street address (minimum 5 characters)
 *           example: "123 Main Street"
 *         city:
 *           type: string
 *           description: City name (minimum 2 characters)
 *           example: "New York"
 *         pinCode:
 *           type: string
 *           description: 6-digit PIN code
 *           example: "123456"
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The user ID
 *         name:
 *           type: string
 *           description: The user's name
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email
 *         phone:
 *           type: string
 *           description: The user's phone number
 *         walletCoins:
 *           type: number
 *           description: The user's wallet coins
 *         role:
 *           type: string
 *           enum: [user]
 *           description: The user's role
 *         isActive:
 *           type: boolean
 *           description: Whether the user is active
 *         isVerified:
 *           type: boolean
 *           description: Whether the user's email is verified
 *         membershipType:
 *           type: string
 *           enum: [basic, bronze, silver, gold, platinum]
 *           description: The user's membership type
 *         address:
 *           $ref: '#/components/schemas/Address'
 *         profileImage:
 *           type: string
 *           description: URL to the user's profile image
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               message:
 *                 type: string
 */

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
 *               - name
 *               - email
 *               - password
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's name (minimum 2 characters)
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password (minimum 6 characters)
 *                 example: password123
 *               phone:
 *                 type: string
 *                 description: Phone number (must be exactly 10 digits)
 *                 example: "9090908871"
 *               address:
 *                 type: object
 *                 description: Optional address object
 *                 properties:
 *                   street:
 *                     type: string
 *                     description: Street address (minimum 5 characters)
 *                     example: "123 Main Street"
 *                   city:
 *                     type: string
 *                     description: City name (minimum 2 characters)
 *                     example: "New York"
 *                   pinCode:
 *                     type: string
 *                     description: 6-digit PIN code
 *                     example: "123456"
 *                 example:
 *                   street: "123 Main Street"
 *                   city: "New York"
 *                   pinCode: "123456"
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: User's profile image (optional)
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: Registration successful. Please check your email to verify your account.
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidAddress:
 *                 value:
 *                   status: error
 *                   message: Invalid address format
 *                   errors:
 *                     - field: address
 *                       message: Address must be a valid JSON object with street, city, and pinCode fields
 *               invalidPinCode:
 *                 value:
 *                   status: error
 *                   message: Validation error
 *                   errors:
 *                     - field: address.pinCode
 *                       message: PIN code must be exactly 6 digits
 *               invalidStreet:
 *                 value:
 *                   status: error
 *                   message: Validation error
 *                   errors:
 *                     - field: address.street
 *                       message: Street address must be at least 5 characters long
 */
router.post('/register', upload.single('profileImage'), validate(CreateUserDto), userController.register);

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
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *     responses:
 *       200:
 *         description: Password reset instructions sent
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
 *                   example: Password reset instructions sent to your email
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successful
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
 *                   example: Password has been reset successfully
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/reset-password', validate(ResetPasswordDto), userController.resetPassword);

// Protected routes
router.use(authenticateUser);

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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *                 description: |
 *                   Address object as JSON string. Example:
 *                   {
 *                     "street": "123 Main St",
 *                     "city": "City Name",
 *                     "pinCode": "123456"
 *                   }
 *               profileImage:
 *                 type: string
 *                 format: binary
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/profile', validate(UpdateUserDto), userController.updateProfile);
router.patch('/profile/image', uploadProfileImage, userController.updateProfile);

/**
 * @swagger
 * /api/users/profile/email:
 *   patch:
 *     summary: Update user email
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/profile/email', validate(EmailUpdateDto), userController.updateEmail);

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
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   example: Password changed successfully
 *       401:
 *         description: Unauthorized or invalid current password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/change-password', validate(ChangePasswordDto), userController.changePassword);

/**
 * @swagger
 * /api/users/membership:
 *   patch:
 *     summary: Update user membership type
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
 *               - membershipType
 *             properties:
 *               membershipType:
 *                 type: string
 *                 enum: [basic, bronze, silver, gold, platinum]
 *     responses:
 *       200:
 *         description: Membership type updated successfully
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: Membership type updated successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/membership', userController.updateMembershipType);

export default router; 