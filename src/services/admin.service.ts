import { AdminRepository } from '../repositories/admin.repository';
import { CreateAdminDtoType, UpdateAdminDtoType, LoginAdminDtoType } from '../dto/admin.dto';
import { AppError } from '../utils/appError';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IAdmin, Admin } from '../models/admin.model';
import { OTPService } from '../utils/otpService';
import bcrypt from 'bcryptjs';
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

      // Create admin with plain password - the model's pre-save hook will hash it
      const admin = await this.adminRepository.create({
        ...data,
        password: data.password // Let the model handle hashing
      });

      // Generate verification token
      const verificationToken = jwt.sign(
        { id: admin._id, email: admin.email, role: admin.role },
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
    
      // Generate login token
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
        console.log('Admin not found with email:', data.email);
        throw new AppError('Invalid credentials', 401);
      }

      // Check if email is verified
      if (!admin.isVerified) {
        console.log('Admin email not verified:', data.email);
        // Resend verification email
        const verificationToken = jwt.sign(
          { id: admin._id, email: admin.email, role: admin.role },
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

      // Check password using the model's comparePassword method
      console.log('Comparing passwords for admin:', data.email);
      const isPasswordValid = await admin.comparePassword(data.password);
      console.log('Password validation result:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('Invalid password for admin:', data.email);
        throw new AppError('Invalid credentials', 401);
      }

      // Generate JWT token
      const token = this.generateToken(admin);

      return { admin, token };
    } catch (error) {
      console.error('Login error:', error);
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
      id: admin._id.toString(), 
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
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }
} 