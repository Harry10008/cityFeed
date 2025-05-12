import { Document } from 'mongoose';
export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  membershipType: 'basic' | 'bronze' | 'silver' | 'gold' | 'platinum';
  isActive: boolean;
  role: 'user' | 'admin' | 'merchant';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
