import { z } from 'zod';

// Base schemas
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters long');
const emailSchema = z.string().email('Invalid email address');

// Request DTOs
export const CreateUserDto = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
  email: emailSchema,
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: passwordSchema,
  role: z.enum(['user']).default('user'),
  membershipType: z.enum(['basic', 'bronze', 'silver', 'gold', 'platinum']),
  address: z.string().min(5, 'Address must be at least 5 characters long'),
  gender: z.enum(['M', 'F', '0']),
  dob: z.string().datetime(),
  profileImage: z.string().optional()
});

export const UpdateUserDto = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters long').optional(),
  email: emailSchema.optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  address: z.string().min(5, 'Address must be at least 5 characters long').optional(),
  gender: z.enum(['M', 'F', '0']).optional(),
  membershipType: z.enum(['basic', 'bronze', 'silver', 'gold', 'platinum']).optional(),
  dob: z.string().datetime().optional(),
  profileImage: z.string().optional(),
  password: passwordSchema.optional(),
  resetToken: z.string().optional(),
  resetTokenExpires: z.date().optional()
});

export const LoginUserDto = z.object({
  email: emailSchema,
  password: passwordSchema
});

export const ForgotPasswordDto = z.object({
  email: emailSchema
});

export const ResetPasswordDto = z.object({
  token: z.string(),
  password: passwordSchema
});

export const ChangePasswordDto = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema
});

// Response DTOs
export const UserResponseDto = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  membershipType: z.enum(['basic', 'bronze', 'silver', 'gold', 'platinum']),
  isActive: z.boolean(),
  role: z.literal('user'),
  profileImage: z.string(),
  createdAt: z.date()
});

export type CreateUserDtoType = z.infer<typeof CreateUserDto>;
export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;
export type LoginUserDtoType = z.infer<typeof LoginUserDto>;
export type ForgotPasswordDtoType = z.infer<typeof ForgotPasswordDto>;
export type ResetPasswordDtoType = z.infer<typeof ResetPasswordDto>;
export type ChangePasswordDtoType = z.infer<typeof ChangePasswordDto>;
export type UserResponseDtoType = z.infer<typeof UserResponseDto>; 