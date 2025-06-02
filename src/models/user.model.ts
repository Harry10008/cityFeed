import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../interfaces/user.interface';

const addressSchema = new Schema({
  street: {
    type: String,
    required: [true, 'Please provide your street address'],
    trim: true,
    minlength: [5, 'Street address must be at least 5 characters long']
  },
  city: {
    type: String,
    required: [true, 'Please provide your city'],
    trim: true,
    minlength: [2, 'City name must be at least 2 characters long']
  },
  pinCode: {
    type: String,
    required: [true, 'Please provide your PIN code'],
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^\d{6}$/.test(v);
      },
      message: 'PIN code must be exactly 6 digits'
    }
  }
}, { _id: false });

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long']
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
      unique: true,
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^\d{10}$/.test(v);
        },
        message: 'Phone number must be exactly 10 digits'
      }
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Please provide your date of birth'],
      validate: {
        validator: function(v: Date) {
          return v instanceof Date && !isNaN(v.getTime());
        },
        message: 'Please provide a valid date of birth'
      }
    },
    walletCoins: {
      type: Number,
      default: 0
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    },
    role: {
      type: String,
      enum: ['user'],
      default: 'user'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    membershipType: {
      type: String,
      enum: ['basic', 'bronze', 'silver', 'gold', 'platinum'],
      default: 'basic'
    },
    address: {
      type: addressSchema,
      required: false
    },
    profileImage: {
      type: String,
      default: '/uploads/users/default-profile.png'
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
userSchema.pre('save', async function(next) {
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
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

export const User = mongoose.model<IUser>('User', userSchema); 