import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  walletCoins: number;
  role: 'user';
  password: string;
  isActive: boolean;
  isVerified: boolean;
  membershipType: 'basic' | 'bronze' | 'silver' | 'gold' | 'platinum';
  address: {
    street: string;
    city: string;
    pinCode: string;
  };
  profileImage?: string;
  resetToken?: string;
  resetTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
