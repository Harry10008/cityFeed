import { Document } from 'mongoose';

export interface IMerchant extends Document {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  businessName: string;
  businessType: string;
  businessAddress: string;
  isActive: boolean;
  role: 'merchant';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
} 