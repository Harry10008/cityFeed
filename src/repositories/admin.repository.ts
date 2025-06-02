import { Admin } from '../models/admin.model';
import { IAdmin } from '../interfaces/admin.interface';
//import { AppError } from '../utils/appError';

export class AdminRepository {
  async create(data: Partial<IAdmin>): Promise<IAdmin> {
    const admin = new Admin(data);
    await admin.save();
    return admin;
  }

  async findById(id: string): Promise<IAdmin | null> {
    return await Admin.findById(id);
  }

  async findByEmail(email: string): Promise<IAdmin | null> {
    return await Admin.findOne({ email });
  }

  async findAll(): Promise<IAdmin[]> {
    return await Admin.find();
  }

  async update(id: string, data: Partial<IAdmin>): Promise<IAdmin | null> {
    return await Admin.findByIdAndUpdate(id, data, { new: true });
  }

  async updatePermissions(id: string, permissions: string[]): Promise<IAdmin | null> {
    return Admin.findByIdAndUpdate(
      id,
      { permissions },
      { new: true, runValidators: true }
    );
  }

  async delete(id: string): Promise<IAdmin | null> {
    return await Admin.findByIdAndDelete(id);
  }

  async findActive(): Promise<IAdmin[]> {
    return await Admin.find({ isActive: true });
  }

  async findVerified(): Promise<IAdmin[]> {
    return await Admin.find({ isVerified: true });
  }

  async findByResetToken(token: string): Promise<IAdmin | null> {
    return await Admin.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() }
    });
  }
} 