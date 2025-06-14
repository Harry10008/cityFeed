import { User } from '../models/user.model';
import { IUser } from '../interfaces/user.interface';
import { AppError } from '../utils/appError';

export class UserRepository {
  async create(data: Partial<IUser>): Promise<IUser> {
    const user = await User.create(data);
    return user;
  }

  async findById(id: string): Promise<IUser | null> {
    try {
      return await User.findById(id).select('+password');
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

  async findByResetToken(token: string): Promise<IUser | null> {
    try {
      return await User.findOne({
        resetToken: token,
        resetTokenExpires: { $gt: Date.now() }
      }).select('+password +resetToken +resetTokenExpires');
    } catch (error) {
      throw new AppError('Error finding user by reset token', 500);
    }
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    try {
      // Convert dateOfBirth to Date if it's a string
      if (data.dateOfBirth && typeof data.dateOfBirth === 'string') {
        try {
          const dateStr = data.dateOfBirth as string;
          const [day, month, year] = dateStr.split('/');
          data.dateOfBirth = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } catch (error) {
          throw new AppError('Invalid date format. Expected DD/MM/YYYY', 400);
        }
      }

      return await User.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      if (error instanceof AppError) throw error;
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