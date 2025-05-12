import { AdminRepository } from '../repositories/admin.repository';
import { CreateAdminDtoType, UpdateAdminDtoType } from '../dto/admin.dto';
import { AppError } from '../utils/appError';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IAdmin } from '../interfaces/admin.interface';

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

    return { admin, token };
  }

  async login(data: { email: string; password: string }): Promise<{ admin: IAdmin; token: string }> {
    // Find admin by email
    const admin = await this.adminRepository.findByEmail(data.email);
    if (!admin) {
      throw new AppError('Invalid credentials', 401);
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
    const payload = { id: admin._id, role: admin.role };
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    const options: SignOptions = { expiresIn: '7d' };
    
    return jwt.sign(payload, secret, options);
  }
} 