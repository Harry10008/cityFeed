import { Document, Types } from 'mongoose';

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  permissions: string[];
  isActive: boolean;
  isVerified: boolean;
  profileImage: string; // Path to profile image
  role: 'admin';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  resetToken?: string;
  resetTokenExpires?: Date;
} 