import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IMerchant extends Document {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  businessName: string;
  businessType: string;
  businessAddress: string;
  businessDescription: string;
  businessImages: string[];
  foodPreference: 'veg' | 'nonveg' | 'both';
  profileImage?: string;
  isActive: boolean;
  isVerified: boolean;
  role: 'merchant';
  resetToken?: string;
  resetTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const merchantSchema = new Schema<IMerchant>({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    minlength: [10, 'Phone number must be at least 10 digits']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    minlength: [5, 'Address must be at least 5 characters long']
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  businessType: {
    type: String,
    required: [true, 'Business type is required'],
    default: 'restaurant'
  },
  businessAddress: {
    type: String,
    required: [true, 'Business address is required']
  },
  businessDescription: {
    type: String,
    required: [true, 'Business description is required'],
    minlength: [50, 'Business description must be at least 50 characters long']
  },
  businessImages: {
    type: [String],
    required: [true, 'At least 3 business images are required'],
    validate: {
      validator: function(images: string[]) {
        return images && images.length >= 3 && images.length <= 10;
      },
      message: 'You must provide between 3 and 10 business images'
    }
  },
  foodPreference: {
    type: String,
    enum: ['veg', 'nonveg', 'both'],
    default: 'both'
  },
  profileImage: {
    type: String,
    default: '/uploads/merchants/default-profile.png'
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
  },
  resetToken: String,
  resetTokenExpires: Date
}, {
  timestamps: true
});

// Hash password before saving
merchantSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }
  
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
    console.error('Error comparing passwords:', error);
    return false;
  }
};

export const Merchant = mongoose.model<IMerchant>('Merchant', merchantSchema); 