import { AdminRepository } from '../repositories/admin.repository';
import { CreateAdminDtoType, UpdateAdminDtoType, LoginAdminDtoType } from '../dto/admin.dto';
import { AppError } from '../utils/appError';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IAdmin } from '../interfaces/admin.interface';
import { sendVerificationEmail, generateVerificationToken } from '../utils/emailService';
import { Admin } from '../models/admin.model';
import bcrypt from 'bcryptjs';

export class AdminService {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  async register(data: CreateAdminDtoType): Promise<{ admin: IAdmin; token: string }> {
    try {
      // Check if email already exists
      const existingEmailAdmin = await Admin.findOne({ email: data.email });
      if (existingEmailAdmin) {
        throw new AppError('Email already registered', 400);
      }

      // Create admin with default values for required fields
      const adminData = {
        ...data,
        isActive: true,
        isVerified: false
      };

      const admin = await this.adminRepository.create(adminData);
    
      // Generate tokens
      const token = this.generateToken(admin);
      const verificationToken = generateVerificationToken(admin._id.toString(), admin.email, admin.role);
    
      // Send verification email
      try {
        await sendVerificationEmail(admin.email, verificationToken);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // Don't throw error here, just log it. Admin can request verification email later
      }
    
      return { admin, token };
    } catch (error) {
      // Handle mongoose duplicate key error
      if (error.code === 11000) {
        if (error.keyPattern?.email) {
          throw new AppError('Email already registered', 400);
        }
      }
      throw error;
    }
  }

  async login(data: LoginAdminDtoType): Promise<{ admin: IAdmin; token: string }> {
    // Find admin by email and explicitly select password field
    const admin = await Admin.findOne({ email: data.email }).select('+password');
    if (!admin) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if email is verified
    if (!admin.isVerified) {
      // Resend verification email
      const verificationToken = generateVerificationToken(admin._id.toString(), admin.email, admin.role);
      try {
        await sendVerificationEmail(admin.email, verificationToken);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
      }
      
      throw new AppError('Please verify your email to login. A new verification email has been sent.', 401);
    }

    // Check password using the model's comparePassword method
    const isPasswordValid = await admin.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = this.generateToken(admin);

    return { admin, token };
  }

  async getProfile(adminId: string): Promise<IAdmin> {
    const admin = await this.adminRepository.findById(adminId);
    if (!admin) {
      throw new AppError('Admin not found', 404);
    }
    return admin;
  }

  async updateProfile(adminId: string, data: UpdateAdminDtoType): Promise<IAdmin> {
    const admin = await this.adminRepository.update(adminId, data);
    if (!admin) {
      throw new AppError('Admin not found', 404);
    }
    return admin;
  }

  private generateToken(admin: IAdmin): string {
    const payload = { 
      id: admin._id.toString(), 
      role: admin.role,
      isVerified: admin.isVerified 
    };
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    const options: SignOptions = { expiresIn: '7d' };
    
    return jwt.sign(payload, secret, options);
  }

  async verifyAdmin(adminId: string): Promise<IAdmin> {
    const admin = await this.adminRepository.findById(adminId);
    if (!admin) {
      throw new AppError('Admin not found', 404);
    }
    
    if (admin.isVerified) {
      throw new AppError('Email already verified', 400);
    }
    
    admin.isVerified = true;
    await admin.save();
    
    return admin;
  }

  async updateEmail(adminId: string, newEmail: string): Promise<IAdmin> {
    // Check if admin exists and is verified
    const admin = await this.adminRepository.findById(adminId);
    if (!admin) {
      throw new AppError('Admin not found', 404);
    }
    
    // Check if admin's email is verified
    if (!admin.isVerified) {
      throw new AppError('Please verify your current email before updating to a new one', 400);
    }
    
    // Check if new email is already registered
    const existingAdmin = await this.adminRepository.findByEmail(newEmail);
    if (existingAdmin) {
      throw new AppError('Email already registered', 400);
    }

    // Update email
    admin.email = newEmail;
    admin.isVerified = false; // Require verification for new email
    await admin.save();

    // Send verification email for new email
    const verificationToken = generateVerificationToken(admin._id.toString(), admin.email, admin.role);
    
    try {
      await sendVerificationEmail(admin.email, verificationToken);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
    }

    return admin;
  }

  async findByEmail(email: string): Promise<IAdmin | null> {
    const admin = await Admin.findOne({ email }).select('+password');
    return admin;
  }

  async findById(id: string): Promise<IAdmin | null> {
    const admin = await Admin.findById(id).select('+password');
    return admin;
  }

  async findByResetToken(token: string): Promise<IAdmin | null> {
    const admin = await Admin.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() }
    });
    return admin;
  }

  async update(id: string, data: UpdateAdminDtoType): Promise<IAdmin | null> {
    const admin = await Admin.findById(id);
    if (!admin) {
      return null;
    }

    // Update fields
    Object.assign(admin, data);
    await admin.save();

    return admin;
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
} 