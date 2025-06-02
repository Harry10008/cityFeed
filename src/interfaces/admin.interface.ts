import { Document, Types } from 'mongoose';

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  role: 'admin';
  permissions: string[];
  isActive: boolean;
  isVerified: boolean;
  resetToken?: string;
  resetTokenExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
} 