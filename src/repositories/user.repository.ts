import { User } from '../models/user.model';
import { IUser } from '../interfaces/user.interface';
import {  UpdateUserDtoType } from '../dto/user.dto';
import { AppError } from '../utils/appError';

export class UserRepository {
  async create(data: Partial<IUser>): Promise<IUser> {
    const user = await User.create(data);
    return user;
  }

  async findById(id: string): Promise<IUser | null> {
    try {
      return await User.findById(id);
    } catch (error) {
      throw new AppError('Error finding user', 500);
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email }).select('+password');;
    } catch (error) {
      throw new AppError('Error finding user', 500);
    }
  }

  async update(id: string, data: UpdateUserDtoType): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      throw new AppError('Error updating user', 500);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await User.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new AppError('Error deleting user', 500);
    }
  }

  async findAll(): Promise<IUser[]> {
    try {
      return await User.find();
    } catch (error) {
      throw new AppError('Error finding users', 500);
    }
  }

  async updateMembershipType(id: string, membershipType: 'basic' | 'bronze' | 'silver' | 'gold' | 'platinum'): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(
        id,
        { membershipType },
        { new: true }
      );
    } catch (error) {
      throw new AppError('Error updating user membership type', 500);
    }
  }
  async verifyUser(id: string): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(id, { isVerified: true }, { new: true });
    } catch (error) {
      throw new AppError('Error verifying user', 500);
    }
  }

  async findByMobile(mobile: string): Promise<IUser | null> {
    return await User.findOne({ mobile });
  }
} 