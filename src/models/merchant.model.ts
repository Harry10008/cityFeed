import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new Schema({
  street: {
    type: String,
    required: [true, 'Street is required'],
    trim: true
  },
  line1: {
    type: String,
    required: [true, 'Address line 1 is required'],
    trim: true
  },
  line2: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^\d{6}$/.test(v);
      },
      message: 'Pincode must be 6 digits'
    }
  }
}, { _id: false });

export interface IMerchant extends Document {
  _id: Types.ObjectId;
  businessName: string;
  businessAddress: {
    street: string;
    line1: string;
    line2?: string;
    pincode: string;
  };
  offers?: Types.ObjectId[];
  phone: string;
  email: string;
  password: string;
  businessImages: string[];
  businessType: string;
  businessDescription: string;
  isActive: boolean;
  isVerified: boolean;
  role: 'merchant';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const merchantSchema = new Schema<IMerchant>({
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  businessAddress: {
    type: addressSchema,
    required: [true, 'Business address is required']
  },
  offers: [{
    type: Schema.Types.ObjectId,
    ref: 'Offer'
  }],
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    minlength: [10, 'Phone number must be at least 10 digits']
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
  businessType: {
    type: String,
    required: [true, 'Business type is required'],
    default: 'restaurant'
  },
  businessDescription: {
    type: String,
    required: [true, 'Business description is required'],
    minlength: [50, 'Business description must be at least 50 characters long']
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false,
    select: false
  },
  role: {
    type: String,
    enum: ['merchant'],
    default: 'merchant',
    select: false
  }
}, {
  timestamps: true
});

// Hash password before saving
merchantSchema.pre('save', async function(next) {
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