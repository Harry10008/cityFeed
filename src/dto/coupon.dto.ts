import { z } from 'zod';

// Request DTOs
export const CreateCouponDto = z.object({
  code: z.string().min(3),
  title: z.string().min(3),
  description: z.string().min(10),
  discountPercentage: z.number().min(0).max(100),
  maxDiscountAmount: z.number().positive(),
  minPurchaseAmount: z.number().positive().optional(),
  maxPurchaseAmount: z.number().positive().optional(),
  startDate: z.date(),
  endDate: z.date()
});

export const UpdateCouponDto = CreateCouponDto.partial();

export const RedeemCouponDto = z.object({
  amount: z.number().positive()
});

// Response DTOs
export const CouponResponseDto = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  description: z.string(),
  discountPercentage: z.number(),
  maxDiscountAmount: z.number(),
  minPurchaseAmount: z.number().optional(),
  maxPurchaseAmount: z.number().optional(),
  startDate: z.date(),
  endDate: z.date(),
  merchant: z.string(),
  isActive: z.boolean(),
  createdAt: z.date()
});

export type CreateCouponDtoType = z.infer<typeof CreateCouponDto>;
export type UpdateCouponDtoType = z.infer<typeof UpdateCouponDto>;
export type RedeemCouponDtoType = z.infer<typeof RedeemCouponDto>;
export type CouponResponseDtoType = z.infer<typeof CouponResponseDto>; 