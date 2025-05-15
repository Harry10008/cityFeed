import { z } from 'zod';

// Request DTOs
export const CreateMerchantDto = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10),
  businessName: z.string().min(2),
  businessType: z.string().min(2),
  businessAddress: z.string().min(5),
  foodPreference: z.enum(['veg', 'nonveg', 'both']),
  images: z.array(z.string()).min(2).max(5)
});

export const UpdateMerchantDto = CreateMerchantDto.partial();

export const LoginMerchantDto = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const EmailUpdateDto = z.object({
  newEmail: z.string().email()
});

export const VerifyEmailDto = z.object({
  newEmail: z.string().email(),
  otp: z.string().length(6)
});

// Response DTOs
export const MerchantResponseDto = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  businessName: z.string(),
  businessType: z.string(),
  businessAddress: z.string(),
  foodPreference: z.enum(['veg', 'nonveg', 'both']),
  images: z.array(z.string()),
  isActive: z.boolean(),
  isVerified: z.boolean(),
  role: z.literal('merchant'),
  createdAt: z.date()
});

export type CreateMerchantDtoType = z.infer<typeof CreateMerchantDto>;
export type UpdateMerchantDtoType = z.infer<typeof UpdateMerchantDto>;
export type LoginMerchantDtoType = z.infer<typeof LoginMerchantDto>;
export type EmailUpdateDtoType = z.infer<typeof EmailUpdateDto>;
export type VerifyEmailDtoType = z.infer<typeof VerifyEmailDto>;
export type MerchantResponseDtoType = z.infer<typeof MerchantResponseDto>; 