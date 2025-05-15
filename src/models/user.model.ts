import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../interfaces/user.interface';

const userSchema = new Schema<IUser>(
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
      unique: true,
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Please provide your address'],
      trim: true
    },
    membershipType: {
      type: String,
      enum: ['basic', 'bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    },    
    isActive: {
      type: Boolean,
      default: true
    },
    gender: {
      type: String,
      enum: ['M', 'F', '0'],
      required: [true, 'Please provide your gender'],
    },
    
    role: {
      type: String,
      enum: ['user'],
      default: 'user'
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    dob: {
      type: Date,
      required: [true, 'Please provide your date of birth']
    },
    profileImage: {
      type: String,
      default: '/uploads/users/default-profile.png'
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: unknown) {
    next(err as Error);
  }
});


// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

export const User = mongoose.model<IUser>('User', userSchema); 