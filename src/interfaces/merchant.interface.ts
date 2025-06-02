import { Document, Types } from 'mongoose';
import { IAddress } from './address.interface';

export interface IMerchant extends Document {
  _id: Types.ObjectId;
  businessName: string;
  email: string;
  password: string;
  phone: string;
  businessAddress: IAddress;
  businessType: string;
  businessDescription: string;
  businessImages: string[];
  offers: Types.ObjectId[];
  isActive: boolean;
  isVerified: boolean;
  role: string;
  resetToken?: string;
  resetTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  toObject(): any;
} 