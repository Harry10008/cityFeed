import { z } from 'zod';

export const CreateTransactionDto = z.object({
  merchantId: z.string(),
  amount: z.number().positive(),
  type: z.enum(['credit', 'debit']),
  description: z.string().optional()
});

export type CreateTransactionDto = z.infer<typeof CreateTransactionDto>;