import { Router } from 'express';
import { MerchantController } from '../controllers/merchant.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { CreateMerchantDto, LoginMerchantDto, UpdateMerchantDto } from '../dto/merchant.dto';

const router = Router();
const merchantController = new MerchantController();

// Public routes
router.post('/register', validate(CreateMerchantDto), merchantController.register);
router.post('/login', validate(LoginMerchantDto), merchantController.login);
router.get('/category/:category', merchantController.getMerchantsByCategory);

// Protected routes
router.use(protect);
router.get('/profile', merchantController.getProfile);
router.patch('/profile', validate(UpdateMerchantDto), merchantController.updateProfile);

export default router; 