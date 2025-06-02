// import { z } from 'zod';

// // Request DTOs
// export const CreateCouponDto = z.object({
//   code: z.string().min(3),
//   title: z.string().min(3),
//   description: z.string().min(10),
//   discountType: z.enum(['percentage', 'fixed']),
//   discountValue: z.number().positive(),
//   minPurchaseAmount: z.number().positive().optional(),
//   maxDiscountAmount: z.number().positive().optional(),
//   startDate: z.date(),
//   endDate: z.date(),
//   category: z.string().min(2),
//   termsAndConditions: z.array(z.string()),
//   maxRedemptions: z.number().positive().optional()
// });

// export const UpdateCouponDto = CreateCouponDto.partial();

// export const RedeemCouponDto = z.object({
//   amount: z.number().positive()
// });

// // Response DTOs
// export const CouponResponseDto = z.object({
//   id: z.string(),
//   code: z.string(),
//   title: z.string(),
//   description: z.string(),
//   discountType: z.enum(['percentage', 'fixed']),
//   discountValue: z.number(),
//   minPurchaseAmount: z.number().optional(),
//   maxDiscountAmount: z.number().optional(),
//   startDate: z.date(),
//   endDate: z.date(),
//   merchant: z.string(),
//   category: z.string(),
//   termsAndConditions: z.array(z.string()),
//   isActive: z.boolean(),
//   maxRedemptions: z.number().optional(),
//   currentRedemptions: z.number(),
//   createdAt: z.date()
// });

// export type CreateCouponDtoType = z.infer<typeof CreateCouponDto>;
// export type UpdateCouponDtoType = z.infer<typeof UpdateCouponDto>;
// export type RedeemCouponDtoType = z.infer<typeof RedeemCouponDto>;
// export type CouponResponseDtoType = z.infer<typeof CouponResponseDto>; 


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
  startDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Date must be in dd/mm/yyyy format')
    .transform((str) => {
      const [day, month, year] = str.split('/');
      return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
    }),
  endDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Date must be in dd/mm/yyyy format')
    .transform((str) => {
      const [day, month, year] = str.split('/');
      return new Date(`${year}-${month}-${day}T23:59:59.999Z`);
    })
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
