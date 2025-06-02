import { z } from 'zod';

// Base schemas
//const passwordSchema = z.string().min(6, 'Password must be at least 6 characters long');
//const emailSchema = z.string().email('Invalid email address');

// Address schema
const addressSchema = z.object({
  street: z.string().min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  pinCode: z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits')
}).strict();

// Request DTOs
export const CreateUserDto = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  dateOfBirth: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Date of birth must be in DD/MM/YYYY format'),
  address: addressSchema.optional(),
  profileImage: z.string().optional()
});

export const UpdateUserDto = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  dateOfBirth: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Date of birth must be in DD/MM/YYYY format').optional(),
  address: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    pinCode: z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits')
  }).optional(),
  profileImage: z.string().optional()
});

export const LoginUserDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const EmailUpdateDto = z.object({
  newEmail: z.string().email('Invalid email format')
});

export const ForgotPasswordDto = z.object({
  email: z.string().email('Invalid email format')
});

export const ResetPasswordDto = z.object({
  token: z.string(),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const ChangePasswordDto = z.object({
  currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

// Response DTOs
export const UserResponseDto = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  walletCoins: z.number(),
  role: z.literal('user'),
  isActive: z.boolean(),
  isVerified: z.boolean(),
  membershipType: z.enum(['basic', 'bronze', 'silver', 'gold', 'platinum']),
  dateOfBirth: z.date(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    pinCode: z.string()
  }),
  profileImage: z.string(),
  createdAt: z.date()
});

export type CreateUserDtoType = z.infer<typeof CreateUserDto>;
export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;
export type LoginUserDtoType = z.infer<typeof LoginUserDto>;
export type EmailUpdateDtoType = z.infer<typeof EmailUpdateDto>;
export type ForgotPasswordDtoType = z.infer<typeof ForgotPasswordDto>;
export type ResetPasswordDtoType = z.infer<typeof ResetPasswordDto>;
export type ChangePasswordDtoType = z.infer<typeof ChangePasswordDto>;
export type UserResponseDtoType = z.infer<typeof UserResponseDto>; 