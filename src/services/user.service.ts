import { UserRepository } from '../repositories/user.repository';
import { CreateUserDtoType, UpdateUserDtoType, LoginUserDtoType } from '../dto/user.dto';
import { AppError } from '../utils/appError';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../interfaces/user.interface';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService';
import crypto from 'crypto';

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

      // Create user with gender as is (already in correct format from DTO)
      const user = await this.userRepository.create(data);
    
      // Generate verification token
      const verificationToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      // Send verification email
      try {
        await sendVerificationEmail(user.email, verificationToken);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // Don't throw error here, just log it. User can request verification email later
      }
    
      // Generate login token
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

      // Check if user is verified
      if (!user.isVerified) {
        throw new AppError('Please verify your email before logging in', 401);
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
    console.log('Verifying user with ID:', userId);
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

  async updateEmail(userId: string, newEmail: string): Promise<IUser> {
    // Check if user exists and is verified
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

    // Update email
    user.email = newEmail;
    user.isVerified = false; // Require verification for new email
    await user.save();

    // Send verification email for new email
    const verificationToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
    }

    return user;
  }

  private generateToken(user: IUser): string {
    const payload = { 
      id: user._id, 
      role: user.role,
      isVerified: user.isVerified 
    };
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    const options: SignOptions = { expiresIn: '7d' };
    
    return jwt.sign(payload, secret, options);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await this.userRepository.findByEmail(email);
  }

  async findById(id: string): Promise<IUser | null> {
    return await this.userRepository.findById(id);
  }

  async update(id: string, data: Partial<UpdateUserDtoType>): Promise<IUser | null> {
    return await this.userRepository.update(id, data);
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new AppError('No user found with this email address', 404);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to user
    await this.userRepository.update(user._id.toString(), {
      resetToken,
      resetTokenExpires
    } as Partial<IUser>);

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      throw new AppError('Error sending password reset email', 500);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findByResetToken(token);
    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    if (user.resetTokenExpires && user.resetTokenExpires < new Date()) {
      throw new AppError('Reset token has expired', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await this.userRepository.update(user._id.toString(), {
      password: hashedPassword,
      resetToken: undefined,
      resetTokenExpires: undefined
    } as Partial<IUser>);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.password) {
      throw new AppError('User password not found', 500);
    }

    // Verify current password
    const isPasswordValid = await this.verifyPassword(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.userRepository.update(userId, { password: hashedPassword });
  }

  async updateMembershipType(userId: string, membershipType: 'basic' | 'bronze' | 'silver' | 'gold' | 'platinum'): Promise<IUser> {
    const user = await this.userRepository.updateMembershipType(userId, membershipType);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
} 