import { z } from 'zod';

// Request DTOs
export const CreateAdminDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['admin', 'super_admin'])
});

export const UpdateAdminDto = z.object({
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.enum(['admin', 'super_admin']).optional(),
  resetToken: z.string().optional(),
  resetTokenExpires: z.date().optional()
});

export const LoginAdminDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

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

export type CreateAdminDtoType = z.infer<typeof CreateAdminDto>;
export type UpdateAdminDtoType = z.infer<typeof UpdateAdminDto>;
export type LoginAdminDtoType = z.infer<typeof LoginAdminDto>;
export type EmailUpdateDtoType = z.infer<typeof EmailUpdateDto>;
export type VerifyEmailDtoType = z.infer<typeof VerifyEmailDto>;
export type ForgotPasswordDtoType = z.infer<typeof ForgotPasswordDto>;
export type ResetPasswordDtoType = z.infer<typeof ResetPasswordDto>;
export type ChangePasswordDtoType = z.infer<typeof ChangePasswordDto>;
export type AdminResponseDtoType = z.infer<typeof AdminResponseDto>; 