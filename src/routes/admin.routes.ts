import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { CreateAdminDto, EmailUpdateDto, LoginAdminDto, UpdateAdminDto, VerifyEmailDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from '../dto/admin.dto';
import { validateRequest } from '../middleware/validateRequest';
import { authenticateAdmin } from '../middleware/auth';

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
 *               - name
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *                 minLength: 2
 *               role:
 *                 type: string
 *                 enum: [admin, super_admin]
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       400:
 *         description: Validation error
 */
router.post('/register', validateRequest(CreateAdminDto), adminController.register);

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
router.post('/login', validateRequest(LoginAdminDto), adminController.login);

/**
 * @swagger
 * /api/admins/forgot-password:
 *   post:
 *     tags: [Admins]
 *     summary: Request password reset for an admin
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
 *         description: Admin not found
 */
router.post('/forgot-password', validateRequest(ForgotPasswordDto), adminController.forgotPassword);

/**
 * @swagger
 * /api/admins/reset-password:
 *   post:
 *     tags: [Admins]
 *     summary: Reset admin password using token
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
router.post('/reset-password', validateRequest(ResetPasswordDto), adminController.resetPassword);

/**
 * @swagger
 * /api/admins/change-password:
 *   post:
 *     tags: [Admins]
 *     summary: Change admin password
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
 *                 minLength: 6
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Unauthorized - Invalid current password
 */
router.post('/change-password', authenticateAdmin, validateRequest(ChangePasswordDto), adminController.changePassword);

// Protected routes
router.use(protect);
router.use(restrictTo('admin'));

/**
 * @swagger
 * /api/admins/all:
 *   get:
 *     summary: Get all admins
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all admins
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/all', adminController.getAllAdmins);

router.get('/profile', adminController.getProfile);
router.patch('/profile', validate(UpdateAdminDto), adminController.updateProfile);
router.patch('/permissions', adminController.updatePermissions);

// Email update routes
router.post('/profile/email', validate(EmailUpdateDto), adminController.initiateEmailUpdate);
router.post('/profile/email/verify', validate(VerifyEmailDto), adminController.verifyAndUpdateEmail);

export default router; 