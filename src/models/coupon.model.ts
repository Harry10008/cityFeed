import mongoose, { Schema } from 'mongoose';
import { ICoupon } from '../interfaces/coupon.interface';

const couponSchema = new Schema<ICoupon>({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  merchant: {
    type: Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true
  },
  discountType: {
    type: String,
    enum: ['fixed', 'percentage'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minPurchaseAmount: {
    type: Number,
    min: 0
  },
  maxDiscountAmount: {
    type: Number,
    min: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  maxRedemptions: {
    type: Number,
    min: 1
  },
  currentRedemptions: {
    type: Number,
    default: 0,
    min: 0
  },
  termsAndConditions: [{
    type: String,
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
couponSchema.index({ merchant: 1, isActive: 1 });
couponSchema.index({ category: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema); 