import { z } from 'zod';

const businessAddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  line1: z.string().min(1, 'Line 1 is required'),
  line2: z.string().optional(),
  pincode: z.string().min(6, 'Pincode must be at least 6 characters')
});

const offerSchema = z.object({
  title: z.string().min(1, 'Offer title is required'),
  description: z.string().min(1, 'Offer description is required'),
  validUntil: z.string().optional(),
  terms: z.string().optional()
});

// Request DTOs
export const CreateMerchantDto = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters long'),
  businessAddress: z.union([
    businessAddressSchema,
    z.string().transform((str) => {
      try {
        return JSON.parse(str);
      } catch (e) {
        throw new Error('Invalid business address format');
      }
    })
  ]),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  businessImages: z.array(z.any()).optional(),
  businessType: z.string().min(1, 'Business type is required'),
  businessDescription: z.string().min(50, 'Business description must be at least 50 characters long'),
  offers: z.union([
    z.array(offerSchema),
    z.string().transform((str) => {
      try {
        if (str === 'string') return []; // Handle default string value
        return JSON.parse(str);
      } catch (e) {
        return []; // Return empty array if parsing fails
      }
    })
  ]).default([])
});

export const LoginMerchantDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
});

export const UpdateMerchantDto = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters long').optional(),
  businessAddress: z.union([
    businessAddressSchema,
    z.string().transform((str) => {
      try {
        return JSON.parse(str);
      } catch (e) {
        throw new Error('Invalid business address format');
      }
    })
  ]).optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  businessImages: z.array(z.any()).optional(),
  businessType: z.string().optional(),
  businessDescription: z.string().min(50, 'Business description must be at least 50 characters long').optional(),
  offers: z.union([
    z.array(offerSchema),
    z.string().transform((str) => {
      try {
        if (str === 'string') return []; // Handle default string value
        return JSON.parse(str);
      } catch (e) {
        return []; // Return empty array if parsing fails
      }
    })
  ]).optional().default([])
});

// Types
export type CreateMerchantDtoType = z.infer<typeof CreateMerchantDto>;
export type LoginMerchantDtoType = z.infer<typeof LoginMerchantDto>;
export type UpdateMerchantDtoType = z.infer<typeof UpdateMerchantDto>; 