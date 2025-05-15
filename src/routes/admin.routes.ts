import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { CreateAdminDto, EmailUpdateDto, LoginAdminDto, UpdateAdminDto, VerifyEmailDto } from '../dto/admin.dto';

const router = Router();
const adminController = new AdminController();

// Public routes
router.post('/register', validate(CreateAdminDto), adminController.register);
router.post('/login', validate(LoginAdminDto), adminController.login);
router.get('/verify-email', adminController.verifyEmail);

// Protected routes
router.use(protect);
router.use(restrictTo('admin'));

router.get('/profile', adminController.getProfile);
router.patch('/profile', validate(UpdateAdminDto), adminController.updateProfile);
router.patch('/permissions', adminController.updatePermissions);
router.get('/all', adminController.getAllAdmins);

// Email update routes
router.post('/profile/email', validate(EmailUpdateDto), adminController.initiateEmailUpdate);
router.post('/profile/email/verify', validate(VerifyEmailDto), adminController.verifyAndUpdateEmail);

export default router; 