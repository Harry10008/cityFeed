import { Router } from 'express';
import { MerchantController } from '../controllers/merchant.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { uploadMerchantImages, updateMerchantImages } from '../middleware/upload.middleware';
import { CreateMerchantDto, EmailUpdateDto, LoginMerchantDto, UpdateMerchantDto, VerifyEmailDto } from '../dto/merchant.dto';

const router = Router();
const merchantController = new MerchantController();

// Public routes
router.post('/register', uploadMerchantImages, validate(CreateMerchantDto), merchantController.register);
router.post('/login', validate(LoginMerchantDto), merchantController.login);
router.get('/verify-email', merchantController.verifyEmail);
router.get('/category/:category', merchantController.getMerchants);

// Protected routes
router.use(protect);
router.get('/profile', merchantController.getProfile);
router.patch('/profile', updateMerchantImages, validate(UpdateMerchantDto), merchantController.updateProfile);

// Email update routes
router.post('/profile/email', validate(EmailUpdateDto), merchantController.initiateEmailUpdate);
router.post('/profile/email/verify', validate(VerifyEmailDto), merchantController.verifyAndUpdateEmail);

export default router; 