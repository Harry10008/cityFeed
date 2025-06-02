import mongoose, { Schema } from 'mongoose';
import { ICoupon } from '../interfaces/coupon.interface';

const couponSchema = new Schema<ICoupon>({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  title: {
    type: String,
    required: [true, 'Coupon title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Coupon description is required'],
    trim: true
  },
  merchant: {
    type: Schema.Types.ObjectId,
    ref: 'Merchant',
    required: [true, 'Merchant ID is required']
  },
  discountPercentage: {
    type: Number,
    required: [true, 'Discount percentage is required'],
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100%']
  },
  maxDiscountAmount: {
    type: Number,
    required: [true, 'Maximum discount amount is required'],
    min: [0, 'Maximum discount amount cannot be negative']
  },
  minPurchaseAmount: {
    type: Number,
    min: [0, 'Minimum purchase amount cannot be negative'],
    required: false
  },
  maxPurchaseAmount: {
    type: Number,
    min: [0, 'Maximum purchase amount cannot be negative'],
    required: false
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Validation to ensure endDate is after startDate
couponSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Indexes for efficient querying
couponSchema.index({ merchant: 1, isActive: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema); 