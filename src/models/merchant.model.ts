import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IMerchant } from '../interfaces/merchant.interface';

const merchantSchema = new Schema<IMerchant>(
  {
    fullName: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Please provide your address'],
      trim: true
    },
    businessName: {
      type: String,
      required: [true, 'Please provide your business name'],
      trim: true
    },
    businessType: {
      type: String,
      required: [true, 'Please provide your business type'],
      trim: true
    },
    businessAddress: {
      type: String,
      required: [true, 'Please provide your business address'],
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    role: {
      type: String,
      enum: ['merchant'],
      default: 'merchant'
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
merchantSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
merchantSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

export const Merchant = mongoose.model<IMerchant>('Merchant', merchantSchema); 