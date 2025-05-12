import { Document, Types } from 'mongoose';
import { IUser } from './user.interface';
import { ICoupon } from './coupon.interface';

export interface ICouponRedemption extends Document {
  user: Types.ObjectId;
  coupon: Types.ObjectId;
  amount: number;
  discountAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  redeemedAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
  __v: number;
} 