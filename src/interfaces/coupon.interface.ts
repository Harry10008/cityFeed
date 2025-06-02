// import { Document, Types } from 'mongoose';

// export interface ICoupon extends Document {
//   code: string;
//   title: string;
//   description: string;
//   category: string;
//   merchant: Types.ObjectId;
//   discountType: 'fixed' | 'percentage';
//   discountValue: number;
//   minPurchaseAmount?: number;
//   maxDiscountAmount?: number;
//   startDate: Date;
//   endDate: Date;
//   maxRedemptions?: number;
//   currentRedemptions: number;
//   termsAndConditions: string[];
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;
//   _id: Types.ObjectId;
//   __v: number;
// } 

// import { Document, Types } from 'mongoose';

// export interface ICoupon extends Document {
//   code: string;
//   title: string;
//   description: string;
//   category: string;
//   merchant: Types.ObjectId;
//   discountType: 'fixed' | 'percentage';
//   discountValue: number;
//   minPurchaseAmount?: number;
//   maxDiscountAmount?: number;
//   startDate: Date;
//   endDate: Date;
//   maxRedemptions?: number;
//   currentRedemptions: number;
//   termsAndConditions: string[];
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;
//   _id: Types.ObjectId;
//   __v: number;
// } 

import { Document, Types } from 'mongoose';

export interface ICoupon extends Document {
  code: string;                    // Required: Unique coupon code
  title: string;                   // Required: Coupon title/name
  description: string;             // Required: Brief description of the offer
  merchant: Types.ObjectId;        // Required: Reference to the merchant
  discountPercentage: number;      // Required: Percentage of discount (0-100)
  maxDiscountAmount: number;       // Required: Maximum discount that can be given
  minPurchaseAmount?: number;      // Optional: Minimum bill amount required
  maxPurchaseAmount?: number;      // Optional: Maximum bill amount allowed
  startDate: Date;                 // Required: When the coupon becomes valid
  endDate: Date;                   // Required: When the coupon expires
  isActive: boolean;               // Required: Whether the coupon is currently active
  createdAt: Date;                 // Auto-generated
  updatedAt: Date;                 // Auto-generated
  _id: Types.ObjectId;             // Auto-generated
  __v: number;                     // Auto-generated
}