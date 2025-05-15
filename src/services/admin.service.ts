import { AdminRepository } from '../repositories/admin.repository';
import { CreateAdminDtoType, UpdateAdminDtoType } from '../dto/admin.dto';
import { AppError } from '../utils/appError';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IAdmin } from '../interfaces/admin.interface';
import { generateVerificationToken, sendVerificationEmail } from '../utils/emailService';
import { OTPService } from '../utils/otpService';

export class AdminService {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  async register(data: CreateAdminDtoType): Promise<{ admin: IAdmin; token: string }> {
    // Check if admin already exists
    const existingAdmin = await this.adminRepository.findByEmail(data.email);
    if (existingAdmin) {
      throw new AppError('Email already registered', 400);
    }

    // Create new admin
    const admin = await this.adminRepository.create(data);

    // Generate JWT token
    const token = this.generateToken(admin);

    // Send verification email
    const verificationToken = generateVerificationToken(admin._id.toString(), admin.role);
    await sendVerificationEmail(admin.email, verificationToken, admin.role);

    return { admin, token };
  }

  async login(data: { email: string; password: string }): Promise<{ admin: IAdmin; token: string }> {
    // Find admin by email
    const admin = await this.adminRepository.findByEmail(data.email);
    if (!admin) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if admin email is verified
    if (!admin.isVerified) {
      // Resend verification email
      const verificationToken = generateVerificationToken(admin._id.toString(), admin.role);
      await sendVerificationEmail(admin.email, verificationToken, admin.role);
      
      throw new AppError('Please verify your email to login. A new verification email has been sent.', 401);
    }

    // Check password
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
      role: admin.role,
      isVerified: admin.isVerified
    };
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    const options: SignOptions = { expiresIn: '7d' };
    
    return jwt.sign(payload, secret, options);
  }
} 