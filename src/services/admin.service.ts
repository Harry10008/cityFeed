import { AdminRepository } from '../repositories/admin.repository';
import { CreateAdminDtoType, UpdateAdminDtoType, LoginAdminDtoType } from '../dto/admin.dto';
import { AppError } from '../utils/appError';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IAdmin } from '../interfaces/admin.interface';
import { OTPService } from '../utils/otpService';
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
      const existingAdmin = await this.findByEmail(data.email);
      if (existingAdmin) {
        throw new AppError('Email already registered', 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      // Create admin
      const admin = await this.adminRepository.create({
        ...data,
        password: hashedPassword
      });
    
      // Generate token
      const token = this.generateToken(admin);
    
      return { admin, token };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error creating admin account', 500);
    }
  }

  async login(data: LoginAdminDtoType): Promise<{ admin: IAdmin; token: string }> {
    try {
      // Find admin by email
      const admin = await this.findByEmail(data.email);
      if (!admin) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check password
      const isPasswordValid = await this.verifyPassword(data.password, admin.password);
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }

      // Generate JWT token
      const token = this.generateToken(admin);

      return { admin, token };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error during login', 500);
    }
  }

  async getProfile(adminId: string): Promise<IAdmin> {
    try {
      const admin = await this.findById(adminId);
      if (!admin) {
        throw new AppError('Admin not found', 404);
      }
      return admin;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error fetching admin profile', 500);
    }
  }

  async updateProfile(adminId: string, data: UpdateAdminDtoType): Promise<IAdmin> {
    try {
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }
      
      const admin = await this.update(adminId, data);
      if (!admin) {
        throw new AppError('Admin not found', 404);
      }
      return admin;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error updating admin profile', 500);
    }
  }

  async verifyAdmin(adminId: string): Promise<IAdmin> {
    const admin = await this.adminRepository.findById(adminId);
    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    if (admin.isVerified) {
      throw new AppError('Admin is already verified', 400);
    }

    admin.isVerified = true;
    await admin.save();
    
    return admin;
  }

  async initiateEmailUpdate(adminId: string, newEmail: string): Promise<void> {
    // Check if admin exists
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

    // Send OTP to the new email
    await OTPService.sendOTP('email', adminId, newEmail);
  }

  async verifyAndUpdateEmail(adminId: string, newEmail: string, otp: string): Promise<IAdmin> {
    // Check if admin exists
    const admin = await this.adminRepository.findById(adminId);
    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    // Verify OTP
    const isValid = await OTPService.verifyOTP('email', adminId, otp);
    if (!isValid) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    // Update email
    const updatedAdmin = await this.adminRepository.update(adminId, { email: newEmail });
    if (!updatedAdmin) {
      throw new AppError('Failed to update email', 500);
    }

    return updatedAdmin;
  }

  async updatePermissions(adminId: string, permissions: string[]): Promise<IAdmin> {
    const admin = await this.adminRepository.updatePermissions(adminId, permissions);
    if (!admin) {
      throw new AppError('Admin not found', 404);
    }
    return admin;
  }

  async getAllAdmins(): Promise<IAdmin[]> {
    return await this.adminRepository.findAll();
  }

  private generateToken(admin: IAdmin): string {
    const payload = { 
      id: admin._id, 
      email: admin.email,
      role: admin.role
    };
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    const options: SignOptions = { expiresIn: '7d' };
    
    return jwt.sign(payload, secret, options);
  }

  async findByEmail(email: string): Promise<IAdmin | null> {
    return Admin.findOne({ email }).select('+password');
  }

  async findById(id: string): Promise<IAdmin | null> {
    return Admin.findById(id).select('+password');
  }

  async findByResetToken(token: string): Promise<IAdmin | null> {
    return Admin.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() }
    }).select('+password');
  }

  async update(id: string, data: Partial<UpdateAdminDtoType>): Promise<IAdmin | null> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return Admin.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
} 