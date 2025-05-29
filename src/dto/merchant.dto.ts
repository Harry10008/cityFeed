import { z } from 'zod';

// Request DTOs
export const CreateMerchantDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters long'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters long'),
  businessType: z.string().optional(),
  businessDescription: z.string().min(50, 'Business description must be at least 50 characters long'),
  foodPreference: z.enum(['veg', 'nonveg', 'both']).optional(),
  businessImages: z.array(z.any()).optional()
});

export const LoginMerchantDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
});

export const UpdateMerchantDto = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters long').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  address: z.string().min(5, 'Address must be at least 5 characters long').optional(),
  businessName: z.string().min(2, 'Business name must be at least 2 characters long').optional(),
  businessType: z.string().optional(),
  businessDescription: z.string().min(50, 'Business description must be at least 50 characters long').optional(),
  foodPreference: z.enum(['veg', 'nonveg', 'both']).optional(),
  businessImages: z.array(z.any()).optional()
});

// Types
export type CreateMerchantDtoType = z.infer<typeof CreateMerchantDto>;
export type LoginMerchantDtoType = z.infer<typeof LoginMerchantDto>;
export type UpdateMerchantDtoType = z.infer<typeof UpdateMerchantDto>; 