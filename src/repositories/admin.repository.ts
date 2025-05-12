import { Admin } from '../models/admin.model';
import { IAdmin } from '../interfaces/admin.interface';
import { CreateAdminDtoType, UpdateAdminDtoType } from '../dto/admin.dto';
import { AppError } from '../utils/appError';

export class AdminRepository {
  async create(data: CreateAdminDtoType): Promise<IAdmin> {
    try {
      const admin = await Admin.create(data);
      return admin;
    } catch (error) {
      throw new AppError('Error creating admin', 500);
    }
  }

  async findById(id: string): Promise<IAdmin | null> {
    try {
      return await Admin.findById(id);
    } catch (error) {
      throw new AppError('Error finding admin', 500);
    }
  }

  async findByEmail(email: string): Promise<IAdmin | null> {
    try {
      return await Admin.findOne({ email });
    } catch (error) {
      throw new AppError('Error finding admin', 500);
    }
  }

  async update(id: string, data: UpdateAdminDtoType): Promise<IAdmin | null> {
    try {
      return await Admin.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      throw new AppError('Error updating admin', 500);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await Admin.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new AppError('Error deleting admin', 500);
    }
  }

  async findAll(): Promise<IAdmin[]> {
    try {
      return await Admin.find();
    } catch (error) {
      throw new AppError('Error finding admins', 500);
    }
  }

  async updatePermissions(id: string, permissions: string[]): Promise<IAdmin | null> {
    try {
      return await Admin.findByIdAndUpdate(
        id,
        { permissions },
        { new: true }
      );
    } catch (error) {
      throw new AppError('Error updating admin permissions', 500);
    }
  }
} 