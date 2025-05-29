import { z } from 'zod';

// Request DTOs
export const CreateMerchantDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters long'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters long'),
  businessDescription: z.string().min(50, 'Business description must be at least 50 characters long'),
  businessImages: z.array(z.string()).min(3, 'At least 3 business images are required').max(10, 'Maximum 10 business images allowed'),
  businessType: z.string().optional(),
  foodPreference: z.enum(['veg', 'nonveg', 'both']).optional()
});

export const UpdateMerchantDto = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters long').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  address: z.string().min(5, 'Address must be at least 5 characters long').optional(),
  businessName: z.string().min(2, 'Business name must be at least 2 characters long').optional(),
  businessDescription: z.string().min(50, 'Business description must be at least 50 characters long').optional(),
  businessImages: z.array(z.string()).min(3, 'At least 3 business images are required').max(10, 'Maximum 10 business images allowed').optional(),
  businessType: z.string().optional(),
  foodPreference: z.enum(['veg', 'nonveg', 'both']).optional(),
  profileImage: z.string().optional(),
  resetToken: z.string().optional(),
  resetTokenExpires: z.date().optional()
});

export const LoginMerchantDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
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
  password: z.string().min(6, 'Password must be at least 6 characters long')
});

export const ChangePasswordDto = z.object({
  currentPassword: z.string().min(6, 'Current password must be at least 6 characters long'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long')
});

// Response DTOs
export const MerchantResponseDto = z.object({
  id: z.string(),
  email: z.string(),
  businessName: z.string(),
  businessType: z.string(),
  businessAddress: z.string(),
  foodPreference: z.enum(['veg', 'nonveg', 'both']),
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