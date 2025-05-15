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
    foodPreference: {
      type: String,
      enum: ['veg', 'nonveg', 'both'],
      required: [true, 'Please select food preference']
    },
    images: {
      type: [String],
      required: [true, 'Please upload at least 2 images'],
      validate: {
        validator: function(images: string[]) {
          return images.length >= 2 && images.length <= 5;
        },
        message: 'Please upload between 2 and 5 images'
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: false
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