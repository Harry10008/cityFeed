import mongoose, { Schema } from 'mongoose';
import { ICouponRedemption } from '../interfaces/couponRedemption.interface';

const couponRedemptionSchema = new Schema<ICouponRedemption>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coupon: {
    type: Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  discountAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    required: true
  },
  redeemedAt: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
couponRedemptionSchema.index({ user: 1, status: 1 });
couponRedemptionSchema.index({ coupon: 1, status: 1 });
couponRedemptionSchema.index({ redeemedAt: 1 });

export const CouponRedemption = mongoose.model<ICouponRedemption>('CouponRedemption', couponRedemptionSchema); 