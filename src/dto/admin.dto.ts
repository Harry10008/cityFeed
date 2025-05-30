import { z } from 'zod';

// Base admin schema without role
const baseAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
  profileImage: z.string().optional(),
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
  resetToken: z.string().optional(),
  resetTokenExpires: z.date().optional()
});

// Create admin schema with role
export const createAdminSchema = baseAdminSchema.extend({
  role: z.literal('admin')
});

// Update admin schema without role
export const updateAdminSchema = baseAdminSchema.partial();

// Login admin schema
export const loginAdminSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Request DTOs
export const EmailUpdateDto = z.object({
  newEmail: z.string().email()
});

export const VerifyEmailDto = z.object({
  newEmail: z.string().email(),
  otp: z.string().length(6)
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
export const AdminResponseDto = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.enum(['admin', 'super_admin']),
  createdAt: z.date()
});

// Types
export type CreateAdminDtoType = z.infer<typeof createAdminSchema>;
export type UpdateAdminDtoType = z.infer<typeof updateAdminSchema>;
export type LoginAdminDtoType = z.infer<typeof loginAdminSchema>;
export type EmailUpdateDtoType = z.infer<typeof EmailUpdateDto>;
export type VerifyEmailDtoType = z.infer<typeof VerifyEmailDto>;
export type ForgotPasswordDtoType = z.infer<typeof ForgotPasswordDto>;
export type ResetPasswordDtoType = z.infer<typeof ResetPasswordDto>;
export type ChangePasswordDtoType = z.infer<typeof ChangePasswordDto>;
export type AdminResponseDtoType = z.infer<typeof AdminResponseDto>; 