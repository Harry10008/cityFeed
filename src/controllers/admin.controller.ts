// import { Request, Response, NextFunction } from 'express';
// import { AdminService } from '../services/admin.service';
// import { AppError } from '../utils/appError';
// import { sendVerificationEmail } from '../utils/emailService';
// import { Admin } from '../models/admin.model';
// import crypto from 'crypto';
// import jwt from 'jsonwebtoken';
// import { createAdminSchema, loginAdminSchema } from '../dto/admin.dto';
// import { AuthRequest } from '../interfaces/auth.interface';

// export class AdminController {
//   private adminService: AdminService;

//   constructor() {
//     this.adminService = new AdminService();
//   }

//   register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const adminData = createAdminSchema.parse(req.body);
//       const { admin, token } = await this.adminService.register(adminData);
      
//       res.status(201).json({
//         status: 'success',
//         data: {
//           admin: {
//             id: admin._id,
//             email: admin.email,
//             fullName: admin.fullName
//           },
//           token
//         },
//         message: 'Registration successful. Please check your email to verify your account.'
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const { token } = req.body;
//       if (!token) {
//         throw new AppError('Verification token is required', 400);
//       }

//       const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
//       const admin = await this.adminService.verifyAdmin(decoded.id);

//       res.status(200).json({
//         status: 'success',
//         message: 'Email verified successfully',
//         data: { admin }
//       });
//     } catch (error) {
//       if (error instanceof jwt.JsonWebTokenError) {
//         next(new AppError('Invalid or expired token', 400));
//       } else {
//         next(error);
//       }
//     }
//   };

//   login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const loginData = loginAdminSchema.parse(req.body);
//       const { admin, token } = await this.adminService.login(loginData);
      
//       res.status(200).json({
//         status: 'success',
//         data: {
//           admin: {
//             id: admin._id,
//             email: admin.email,
//             fullName: admin.fullName
//           },
//           token
//         }
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       if (!req.user?.id) {
//         throw new AppError('Not authenticated', 401);
//       }

//       const admin = await this.adminService.getProfile(req.user.id);
      
//       res.status(200).json({
//         status: 'success',
//         data: {
//           admin
//         }
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       if (!req.user?.id) {
//         throw new AppError('Not authenticated', 401);
//       }

//       const admin = await this.adminService.updateProfile(req.user.id, req.body);
      
//       res.status(200).json({
//         status: 'success',
//         data: {
//           admin
//         }
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   updateEmail = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       if (!req.user?.id) {
//         throw new AppError('Not authenticated', 401);
//       }

//       const { newEmail } = req.body;
//       const admin = await this.adminService.updateEmail(req.user.id, newEmail);
//       res.status(200).json({
//         status: 'success',
//         message: 'Email updated successfully. Please verify your new email.',
//         data: { admin }
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { email } = req.body;
//       const admin = await Admin.findOne({ email });
      
//       if (!admin) {
//         throw new AppError('No admin found with that email address', 404);
//       }

//       // Generate reset token
//       const resetToken = crypto.randomBytes(32).toString('hex');
//       admin.resetToken = crypto
//         .createHash('sha256')
//         .update(resetToken)
//         .digest('hex');
//       admin.resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
//       await admin.save();

//       // Send reset email
//       try {
//         await sendVerificationEmail(admin.email, resetToken);
//         res.status(200).json({
//           status: 'success',
//           message: 'Password reset email sent'
//         });
//       } catch (error) {
//         admin.resetToken = undefined;
//         admin.resetTokenExpires = undefined;
//         await admin.save();
//         throw new AppError('Error sending email. Please try again later.', 500);
//       }
//     } catch (error) {
//       next(error);
//     }
//   };

//   resetPassword = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { token, password } = req.body;
      
//       // Hash token
//       const hashedToken = crypto
//         .createHash('sha256')
//         .update(token)
//         .digest('hex');

//       const admin = await Admin.findOne({
//         resetToken: hashedToken,
//         resetTokenExpires: { $gt: Date.now() }
//       });

//       if (!admin) {
//         throw new AppError('Token is invalid or has expired', 400);
//       }

//       // Update password
//       admin.password = password;
//       admin.resetToken = undefined;
//       admin.resetTokenExpires = undefined;
//       await admin.save();

//       res.status(200).json({
//         status: 'success',
//         message: 'Password reset successful'
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
//     try {
//       if (!req.user?.id) {
//         throw new AppError('Not authenticated', 401);
//       }

//       const { currentPassword, newPassword } = req.body;
//       const admin = await Admin.findById(req.user.id).select('+password');

//       if (!admin) {
//         throw new AppError('Admin not found', 404);
//       }

//       // Check current password
//       const isPasswordValid = await admin.comparePassword(currentPassword);
//       if (!isPasswordValid) {
//         throw new AppError('Current password is incorrect', 401);
//       }

//       // Update password
//       admin.password = newPassword;
//       await admin.save();

//       res.status(200).json({
//         status: 'success',
//         message: 'Password changed successfully'
//       });
//     } catch (error) {
//       next(error);
//     }
//   };
// } 

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { User } from '../models/user.model';
import { Merchant } from '../models/merchant.model';
import { Transaction } from '../models/transaction.model';
import { Wallet } from '../models/wallet.model';
import { Admin } from '../models/admin.model';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '../utils/emailService';

export class AdminController {
  // Registration
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, fullName, phone, address } = req.body;

      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        throw new AppError('Email already registered', 400);
      }

      // Create new admin
      const admin = await Admin.create({
        email,
        password,
        fullName,
        phone,
        address,
        role: 'admin'
      });

      // Generate verification token
      const verificationToken = jwt.sign(
        { id: admin._id, email: admin.email, role: 'admin' },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      // Send verification email
      await sendVerificationEmail(admin.email, verificationToken);

      // Generate JWT token
      const token = jwt.sign(
        { id: admin._id, email: admin.email, role: 'admin' },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        status: 'success',
        data: {
          admin: {
            id: admin._id,
            email: admin.email,
            fullName: admin.fullName,
            role: admin.role
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Login
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Find admin
      const admin = await Admin.findOne({ email }).select('+password');
      if (!admin) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check password
      const isPasswordValid = await admin.comparePassword(password);
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }

      // Generate token
      const token = jwt.sign(
        { id: admin._id, email: admin.email, role: 'admin' },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        status: 'success',
        data: {
          admin: {
            id: admin._id,
            email: admin.email,
            fullName: admin.fullName,
            role: admin.role
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Email verification
  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      const admin = await Admin.findById(decoded.id);
      if (!admin) {
        throw new AppError('Admin not found', 404);
      }

      admin.isVerified = true;
      await admin.save();

      res.status(200).json({
        status: 'success',
        message: 'Email verified successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Forgot password
  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const admin = await Admin.findOne({ email });

      if (!admin) {
        throw new AppError('No admin found with that email', 404);
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { id: admin._id, email: admin.email, role: 'admin' },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      // Send reset email
      await sendVerificationEmail(admin.email, resetToken);

      res.status(200).json({
        status: 'success',
        message: 'Password reset email sent'
      });
    } catch (error) {
      next(error);
    }
  };

  // Reset password
  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      const admin = await Admin.findById(decoded.id);
      if (!admin) {
        throw new AppError('Admin not found', 404);
      }

      admin.password = password;
      await admin.save();

      res.status(200).json({
        status: 'success',
        message: 'Password reset successful'
      });
    } catch (error) {
      next(error);
    }
  };

  // Update email
  updateEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const admin = await Admin.findById(req.user._id);

      if (!admin) {
        throw new AppError('Admin not found', 404);
      }

      // Check if email is already taken
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        throw new AppError('Email already in use', 400);
      }

      admin.email = email;
      admin.isVerified = false;
      await admin.save();

      // Send verification email
      const verificationToken = jwt.sign(
        { id: admin._id, email: admin.email, role: 'admin' },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );
      await sendVerificationEmail(admin.email, verificationToken);

      res.status(200).json({
        status: 'success',
        message: 'Email updated. Please verify your new email.'
      });
    } catch (error) {
      next(error);
    }
  };

  // Change password
  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const admin = await Admin.findById(req.user._id).select('+password');

      if (!admin) {
        throw new AppError('Admin not found', 404);
      }

      // Check current password
      const isPasswordValid = await admin.comparePassword(currentPassword);
      if (!isPasswordValid) {
        throw new AppError('Current password is incorrect', 401);
      }

      admin.password = newPassword;
      await admin.save();

      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Profile management
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({
        status: 'success',
        data: req.user
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedAdmin = await Admin.findByIdAndUpdate(
        req.user._id,
        req.body,
        { new: true, runValidators: true }
      );

      res.status(200).json({
        status: 'success',
        data: updatedAdmin
      });
    } catch (error) {
      next(error);
    }
  };

  // User management
  getAllUsers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await User.find({ role: 'user' })
        .select('-password')
        .sort({ createdAt: -1 });

      res.status(200).json({
        status: 'success',
        data: users
      });
    } catch (error) {
      next(error);
    }
  };

  getUserDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const wallet = await Wallet.findOne({ userId: new Types.ObjectId(userId) });
      const transactions = await Transaction.find({ userId: new Types.ObjectId(userId) })
        .populate('merchantId', 'businessName')
        .sort({ createdAt: -1 });

      res.status(200).json({
        status: 'success',
        data: {
          user,
          wallet,
          transactions
        }
      });
    } catch (error) {
      next(error);
    }
  };

  updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        { isActive },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.status(200).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  // Merchant management
  getAllMerchants = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const merchants = await Merchant.find()
        .select('-password')
        .sort({ createdAt: -1 });

      res.status(200).json({
        status: 'success',
        data: merchants
      });
    } catch (error) {
      next(error);
    }
  };

  getMerchantDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { merchantId } = req.params;
      const merchant = await Merchant.findById(merchantId).select('-password');
      
      if (!merchant) {
        throw new AppError('Merchant not found', 404);
      }

      const transactions = await Transaction.find({ merchantId: new Types.ObjectId(merchantId) })
        .populate('userId', 'fullName')
        .sort({ createdAt: -1 });

      res.status(200).json({
        status: 'success',
        data: {
          merchant,
          transactions
        }
      });
    } catch (error) {
      next(error);
    }
  };

  updateMerchantStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { merchantId } = req.params;
      const { isActive, isVerified } = req.body;

      const merchant = await Merchant.findByIdAndUpdate(
        merchantId,
        { isActive, isVerified },
        { new: true, runValidators: true }
      ).select('-password');

      if (!merchant) {
        throw new AppError('Merchant not found', 404);
      }

      res.status(200).json({
        status: 'success',
        data: merchant
      });
    } catch (error) {
      next(error);
    }
  };

  // Transaction management
  getAllTransactions = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const transactions = await Transaction.find()
        .populate('userId', 'fullName')
        .populate('merchantId', 'businessName')
        .sort({ createdAt: -1 });

      res.status(200).json({
        status: 'success',
        data: transactions
      });
    } catch (error) {
      next(error);
    }
  };
}