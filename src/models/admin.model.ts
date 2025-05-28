import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IAdmin } from '../interfaces/admin.interface';

const adminSchema = new Schema<IAdmin>(
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
    permissions: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    profileImage: {
      type: String,
      default: '/uploads/admins/default-profile.png'
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin'
    },
    resetToken: {
      type: String,
      select: false
    },
    resetTokenExpires: {
      type: Date,
      select: false
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
adminSchema.pre('save', async function(next) {
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
adminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

export const Admin = mongoose.model<IAdmin>('Admin', adminSchema); 