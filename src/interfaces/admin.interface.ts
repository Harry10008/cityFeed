import { Document } from 'mongoose';

export interface IAdmin extends Document {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  permissions: string[];
  isActive: boolean;
  role: 'admin';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
} 