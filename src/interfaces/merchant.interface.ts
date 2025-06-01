import { Document, Types } from 'mongoose';

interface IAddress {
  street: string;
  line1: string;
  line2?: string;
  pincode: string;
}

export interface IMerchant extends Document {
  _id: Types.ObjectId;
  businessName: string;
  businessAddress: IAddress;
  offers?: Types.ObjectId[];
  phone: string;
  email: string;
  password: string;
  businessImages: string[];
  businessType: string;
  businessDescription: string;
  isActive: boolean;
  isVerified: boolean;
  role: 'merchant';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  toObject(): any;
} 