import { z } from 'zod';

// User validation schemas
export const userRegistrationSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  pin: z.string().length(6, 'PIN must be 6 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  membershipType: z.enum(['basic', 'premium', 'vip'])
});

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// Merchant validation schemas
export const merchantRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessType: z.string().min(2, 'Business type must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters')
});

export const merchantLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// Admin validation schemas
export const adminRegistrationSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'superadmin'])
});

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// Coupon validation schemas
export const couponCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  discountPercentage: z.number().min(0).max(100),
  validFrom: z.string().transform(str => new Date(str)),
  validTill: z.string().transform(str => new Date(str)),
  usageLimit: z.number().min(1),
  terms: z.string().min(10, 'Terms must be at least 10 characters')
});

// Coupon redemption validation schema
export const couponRedemptionSchema = z.object({
  code: z.string().min(6, 'Code must be at least 6 characters')
}); 