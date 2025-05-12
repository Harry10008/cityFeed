import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from '../dto/user.dto';

const router = Router();
const userController = new UserController();

// Public routes
router.post('/register', validate(CreateUserDto), userController.register);//done
router.post('/login', validate(LoginUserDto), userController.login);//done

// Protected routes
router.use(protect);
router.get('/profile', userController.getProfile);//done
router.patch('/profile', validate(UpdateUserDto), userController.updateProfile);
router.patch('/membership', userController.updateMembershipType);

export default router; 