import { AdminRepository } from '../repositories/admin.repository';
import { CreateAdminDtoType, UpdateAdminDtoType, LoginAdminDtoType } from '../dto/admin.dto';
import { AppError } from '../utils/appError';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IAdmin } from '../models/admin.model';
import { sendVerificationEmail } from '../utils/emailService';

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

      // Create admin with default values
      const adminData = {
        ...data,
        role: 'admin' as const,
        isActive: true,
        isVerified: false
      };

      const admin = await this.adminRepository.create(adminData);
    
      // Generate tokens
      const token = this.generateToken(admin);
      const verificationToken = jwt.sign(
        { userId: admin._id, email: admin.email, role: admin.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
    
      // Send verification email
      try {
        await sendVerificationEmail(admin.email, verificationToken);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // Don't throw error here, just log it. Admin can request verification email later
      }
    
      return { admin, token };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error creating admin account', 500);
    }
  }

  async login(data: LoginAdminDtoType): Promise<{ admin: IAdmin; token: string }> {
    // Find admin by email
    const admin = await this.adminRepository.findByEmail(data.email);
    if (!admin) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if email is verified
    if (!admin.isVerified) {
      // Resend verification email
      const verificationToken = jwt.sign(
        { userId: admin._id, email: admin.email, role: admin.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      try {
        await sendVerificationEmail(admin.email, verificationToken);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
      }
      
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

  private generateToken(admin: IAdmin): string {
    const payload = { 
      userId: admin._id, 
      email: admin.email,
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
    const verificationToken = jwt.sign(
      { userId: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    try {
      await sendVerificationEmail(admin.email, verificationToken);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
    }

    return admin;
  }

  async findByEmail(email: string): Promise<IAdmin | null> {
    return await this.adminRepository.findByEmail(email);
  }

  async findById(id: string): Promise<IAdmin | null> {
    return await this.adminRepository.findById(id);
  }
} 