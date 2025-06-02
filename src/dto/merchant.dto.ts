import { z } from 'zod';

const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits')
}).transform((data) => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (error) {
      throw new Error('Invalid address format');
    }
  }
  return data;
});

// Request DTOs
export const CreateMerchantDto = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters long'),
  businessAddress: z.union([
    addressSchema,
    z.string().transform((str) => {
      try {
        return JSON.parse(str);
      } catch (error) {
        throw new Error('Invalid address format');
      }
    })
  ]),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  businessImages: z.array(z.any()).optional(),
  businessType: z.string().optional(),
  businessDescription: z.string().min(50, 'Business description must be at least 50 characters long'),
  offers: z.union([
    z.array(z.string()),
    z.string().transform((str) => {
      if (str === '') return [];
      try {
        return JSON.parse(str);
      } catch (error) {
        throw new Error('Invalid offers format');
      }
    })
  ]).optional().default([])
});

export const LoginMerchantDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
});

export const UpdateMerchantDto = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters long').optional(),
  businessAddress: z.union([
    addressSchema,
    z.string().transform((str) => {
      try {
        return JSON.parse(str);
      } catch (error) {
        throw new Error('Invalid address format');
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
    z.array(z.string()),
    z.string().transform((str) => {
      if (str === '') return [];
      try {
        return JSON.parse(str);
      } catch (error) {
        throw new Error('Invalid offers format');
      }
    })
  ]).optional().default([])
});

// Types
export type CreateMerchantDtoType = z.infer<typeof CreateMerchantDto>;
export type LoginMerchantDtoType = z.infer<typeof LoginMerchantDto>;
export type UpdateMerchantDtoType = z.infer<typeof UpdateMerchantDto>; 