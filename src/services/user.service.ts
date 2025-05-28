import { UserRepository } from '../repositories/user.repository';
import { CreateUserDtoType, UpdateUserDtoType, LoginUserDtoType } from '../dto/user.dto';
import { AppError } from '../utils/appError';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../interfaces/user.interface';
import { User } from '../models/user.model';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '../utils/emailService';
import { OTPService } from '../utils/otpService';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: CreateUserDtoType): Promise<{ user: IUser; token: string }> {
    try {
      // Check if email already exists
      const existingUser = await this.findByEmail(data.email);
      if (existingUser) {
        throw new AppError('Email already registered', 400);
      }

      // Check if phone already exists
      const existingPhone = await this.findByPhone(data.phone);
      if (existingPhone) {
        throw new AppError('Phone number already registered', 400);
      }

      // Create user with gender as is (already in correct format from DTO)
      const user = await this.userRepository.create(data);
    
      // Generate token
      const token = this.generateToken(user);
    
      return { user, token };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error creating user account', 500);
    }
  }

  async login(data: LoginUserDtoType): Promise<{ user: IUser; token: string }> {
    try {
      // Find user by email
      const user = await this.findByEmail(data.email);
      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check password
      const isPasswordValid = await this.verifyPassword(data.password, user.password);
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }

      // Generate JWT token
      const token = this.generateToken(user);

      return { user, token };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error during login', 500);
    }
  }

  async getProfile(userId: string): Promise<IUser> {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error fetching user profile', 500);
    }
  }

  async updateProfile(userId: string, data: UpdateUserDtoType): Promise<IUser> {
    try {
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }
      
      const user = await this.update(userId, data);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error updating user profile', 500);
    }
  }

  async verifyUser(userId: string): Promise<IUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isVerified) {
      throw new AppError('User is already verified', 400);
    }

    user.isVerified = true;
    await user.save();
    
    return user;
  }

  async initiateEmailUpdate(userId: string, newEmail: string): Promise<void> {
    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Check if user's email is verified
    if (!user.isVerified) {
      throw new AppError('Please verify your current email before updating to a new one', 400);
    }

    // Check if new email is already registered
    const existingUser = await this.userRepository.findByEmail(newEmail);
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Send OTP to the new email
    await OTPService.sendOTP('email', userId, newEmail);
  }

  async verifyAndUpdateEmail(userId: string, newEmail: string, otp: string): Promise<IUser> {
    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify OTP
    const isValid = await OTPService.verifyOTP('email', userId, otp);
    if (!isValid) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    // Update email
    const updatedUser = await this.userRepository.update(userId, { email: newEmail });
    if (!updatedUser) {
      throw new AppError('Failed to update email', 500);
    }

    return updatedUser;
  }

  async updateMembership(userId: string, membershipType: 'basic' | 'bronze' | 'silver' | 'gold' | 'platinum'): Promise<IUser> {
    const user = await this.userRepository.updateMembershipType(userId, membershipType);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async getAllUsers(): Promise<IUser[]> {
    return await this.userRepository.findAll();
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save hashed token to user
    const updatedUser = await this.update(user._id.toString(), {
      resetToken: hashedToken,
      resetTokenExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    if (!updatedUser) {
      throw new AppError('Failed to update user with reset token', 500);
    }

    // Send reset email
   // const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;
    await sendVerificationEmail(user.email, resetToken, 'user');
  }

  async resetPassword(token: string, password: string): Promise<void> {
    // Hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await this.findByResetToken(hashedToken);

    if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Update password and clear reset token
    const updatedUser = await this.update(user._id.toString(), {
      password,
      resetToken: undefined,
      resetTokenExpires: undefined
    });

    if (!updatedUser) {
      throw new AppError('Failed to update user password', 500);
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await this.verifyPassword(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Update password
    const updatedUser = await this.update(userId, { password: newPassword });
    if (!updatedUser) {
      throw new AppError('Failed to update password', 500);
    }
  }

  private generateToken(user: IUser): string {
    const payload = { 
      id: user._id, 
      email: user.email,
      role: user.role
    };
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    const options: SignOptions = { expiresIn: '7d' };
    
    return jwt.sign(payload, secret, options);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select('+password');
  }

  async findByPhone(phone: string): Promise<IUser | null> {
    return User.findOne({ phone }).select('+password');
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).select('+password');
  }

  async findByResetToken(token: string): Promise<IUser | null> {
    return User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() }
    }).select('+password');
  }

  async update(id: string, data: Partial<UpdateUserDtoType>): Promise<IUser | null> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
} 