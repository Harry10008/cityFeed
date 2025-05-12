import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { CreateAdminDto, LoginAdminDto, UpdateAdminDto } from '../dto/admin.dto';

const router = Router();
const adminController = new AdminController();

// Public routes
router.post('/register', validate(CreateAdminDto), adminController.register);
router.post('/login', validate(LoginAdminDto), adminController.login);

// Protected routes
router.use(protect);
router.use(restrictTo('admin'));

router.get('/profile', adminController.getProfile);
router.patch('/profile', validate(UpdateAdminDto), adminController.updateProfile);
router.patch('/permissions', adminController.updatePermissions);
router.get('/all', adminController.getAllAdmins);

export default router; 