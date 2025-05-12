import { User } from '../models/user.model';
import { IUser } from '../interfaces/user.interface';
import { CreateUserDtoType, UpdateUserDtoType } from '../dto/user.dto';
import { AppError } from '../utils/appError';

export class UserRepository {
  async create(data: CreateUserDtoType): Promise<IUser> {
    try {
      const user = await User.create(data);
      return user;
    } catch (error) {
      throw new AppError('Error creating user', 500);
    }
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

  async updateMembershipType(id: string, membershipType: 'basic' | 'premium' | 'vip'): Promise<IUser | null> {
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
} 