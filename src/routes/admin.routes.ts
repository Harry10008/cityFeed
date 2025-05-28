import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { CreateAdminDto, EmailUpdateDto, LoginAdminDto, UpdateAdminDto, VerifyEmailDto } from '../dto/admin.dto';

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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/register', validate(CreateAdminDto), adminController.register);

/**
 * @swagger
 * /api/admins/login:
 *   post:
 *     summary: Login admin
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
router.post('/login', validate(LoginAdminDto), adminController.login);

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