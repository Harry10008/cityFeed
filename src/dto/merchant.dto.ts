import { z } from 'zod';

// Request DTOs
export const CreateMerchantDto = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10),
  address: z.string().min(5),
  businessName: z.string().min(2),
  businessType: z.string().min(2),
  businessAddress: z.string().min(5)
});

export const UpdateMerchantDto = CreateMerchantDto.partial();

export const LoginMerchantDto = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

// Response DTOs
export const MerchantResponseDto = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  businessName: z.string(),
  businessType: z.string(),
  businessAddress: z.string(),
  isActive: z.boolean(),
  role: z.literal('merchant'),
  createdAt: z.date()
});

export type CreateMerchantDtoType = z.infer<typeof CreateMerchantDto>;
export type UpdateMerchantDtoType = z.infer<typeof UpdateMerchantDto>;
export type LoginMerchantDtoType = z.infer<typeof LoginMerchantDto>;
export type MerchantResponseDtoType = z.infer<typeof MerchantResponseDto>; 