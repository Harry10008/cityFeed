import express from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateMerchant as protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { uploadProfileImage } from '../middleware/upload';
import { 
  CreateUserDto, 
  UpdateUserDto, 
  LoginUserDto,
  EmailUpdateDto
} from '../dto/user.dto';
import multer from 'multer';

const router = express.Router();
const userController = new UserController();
const upload = multer({ dest: 'uploads/' });

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
router.patch('/profile', validate(UpdateUserDto), userController.updateProfile);
router.patch('/profile/image', uploadProfileImage, userController.updateProfile);

// Email update routes
router.patch('/profile/email', validate(EmailUpdateDto), userController.updateEmail);

export default router; 