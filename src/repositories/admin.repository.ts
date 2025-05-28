import { Admin, IAdmin } from '../models/admin.model';
import { AppError } from '../utils/appError';

export class AdminRepository {
  async create(data: Partial<IAdmin>): Promise<IAdmin> {
    try {
      const admin = await Admin.create(data);
      return admin;
    } catch (error) {
      throw new AppError('Error creating admin', 500);
    }
  }

  async findById(id: string): Promise<IAdmin | null> {
    return Admin.findById(id);
  }

  async findByEmail(email: string): Promise<IAdmin | null> {
    return Admin.findOne({ email }).select('+password');
  }

  async findAll(): Promise<IAdmin[]> {
    return Admin.find();
  }

  async update(id: string, data: Partial<IAdmin>): Promise<IAdmin | null> {
    return Admin.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async updatePermissions(id: string, permissions: string[]): Promise<IAdmin | null> {
    return Admin.findByIdAndUpdate(
      id,
      { permissions },
      { new: true, runValidators: true }
    );
  }

  async delete(id: string): Promise<IAdmin | null> {
    return Admin.findByIdAndDelete(id);
  }
} 