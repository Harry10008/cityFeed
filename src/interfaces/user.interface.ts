import { Document,Types } from 'mongoose';
export interface IUser extends Document {
  _id: Types.ObjectId; // 👈 add this line explicitly
  fullName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  gender: 'M' | 'F' | '0';
  membershipType: 'basic' | 'bronze' | 'silver' | 'gold' | 'platinum';
  isActive: boolean;
  role: 'user' | 'admin' | 'merchant';
  dob:Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
