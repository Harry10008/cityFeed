import { Document, Types } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  title: string;
  description: string;
  category: string;
  merchant: Types.ObjectId;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  startDate: Date;
  endDate: Date;
  maxRedemptions?: number;
  currentRedemptions: number;
  termsAndConditions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
  __v: number;
} 