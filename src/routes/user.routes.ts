import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from '../dto/user.dto';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();
const userController = new UserController();

// Public routes
router.post('/register', validate(CreateUserDto), userController.register);
router.post('/login', validate(LoginUserDto), userController.login);
router.get('/verify-email', userController.verifyEmail);

// Protected routes
router.use(protect);

// Profile routes
router.get('/profile', userController.getProfile);
router.patch('/profile', validate(UpdateUserDto), userController.updateProfile);
router.patch('/profile/membership', userController.updateMembershipType);

// Email update routes (with rate limiting)
router.post(
  '/profile/email/initiate',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 3 }), // 3 attempts per 15 minutes
  userController.initiateEmailUpdate
);
router.post(
  '/profile/email/verify',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 attempts per 15 minutes
  userController.verifyAndUpdateEmail
);

// Phone update routes (with rate limiting)
router.post(
  '/profile/phone/initiate',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 3 }), // 3 attempts per 15 minutes
  userController.initiateMobileUpdate
);
router.post(
  '/profile/phone/verify',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 attempts per 15 minutes
  userController.verifyAndUpdateMobile
);

export default router; 