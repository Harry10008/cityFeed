import { z } from 'zod';

export const CreateWalletDto = z.object({
  userId: z.string().min(24, 'Invalid user ID')
});

export const AddCoinsDto = z.object({
  amount: z.number().positive('Amount must be positive'),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string()
});

export const CreateTransactionDto = z.object({
  merchantId: z.string().min(24, 'Invalid merchant ID'),
  offerId: z.string().min(24, 'Invalid offer ID'),
  billAmount: z.number().positive('Bill amount must be positive'),
  discount: z.number().min(0, 'Discount cannot be negative'),
  coinsPaid: z.number().min(0, 'Coins paid cannot be negative')
});

// Types
export type CreateWalletDtoType = z.infer<typeof CreateWalletDto>;
export type AddCoinsDtoType = z.infer<typeof AddCoinsDto>;
export type CreateTransactionDtoType = z.infer<typeof CreateTransactionDto>;