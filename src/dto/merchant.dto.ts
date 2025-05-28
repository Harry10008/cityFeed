import { z } from 'zod';

// Request DTOs
export const CreateMerchantDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  category: z.string(),
  businessImages: z.array(z.string()).optional()
});

export const UpdateMerchantDto = z.object({
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  businessName: z.string().min(2, 'Business name must be at least 2 characters').optional(),
  category: z.string().optional(),
  businessImages: z.array(z.string()).optional(),
  resetToken: z.string().optional(),
  resetTokenExpires: z.date().optional()
});

export const LoginMerchantDto = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const EmailUpdateDto = z.object({
  newEmail: z.string().email('Invalid email format')
});

export const VerifyEmailDto = z.object({
  token: z.string()
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
export const MerchantResponseDto = z.object({
  id: z.string(),
  email: z.string(),
  businessName: z.string(),
  category: z.string(),
  isActive: z.boolean(),
  role: z.literal('merchant'),
  businessImages: z.array(z.string()),
  createdAt: z.date()
});

export type CreateMerchantDtoType = z.infer<typeof CreateMerchantDto>;
export type UpdateMerchantDtoType = z.infer<typeof UpdateMerchantDto>;
export type LoginMerchantDtoType = z.infer<typeof LoginMerchantDto>;
export type EmailUpdateDtoType = z.infer<typeof EmailUpdateDto>;
export type VerifyEmailDtoType = z.infer<typeof VerifyEmailDto>;
export type ForgotPasswordDtoType = z.infer<typeof ForgotPasswordDto>;
export type ResetPasswordDtoType = z.infer<typeof ResetPasswordDto>;
export type ChangePasswordDtoType = z.infer<typeof ChangePasswordDto>;
export type MerchantResponseDtoType = z.infer<typeof MerchantResponseDto>; 