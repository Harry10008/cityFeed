import { Document, Types } from 'mongoose';

export interface IMerchant extends Document {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  businessName: string;
  businessType: string;
  businessAddress: string;
  foodPreference: 'veg' | 'nonveg' | 'both';
  images: string[];
  isActive: boolean;
  isVerified: boolean;
  role: 'merchant';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
} 