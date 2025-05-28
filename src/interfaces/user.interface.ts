import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'merchant' | 'admin' | 'super_admin';
  membershipType: 'basic' | 'bronze' | 'silver' | 'gold' | 'platinum';
  isActive: boolean;
  isVerified: boolean;
  address?: string;
  gender?: 'male' | 'female' | 'other';
  dob?: Date;
  profileImage?: string;
  resetToken?: string;
  resetTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
