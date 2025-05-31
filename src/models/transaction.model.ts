import mongoose, { Schema } from 'mongoose';
import { ITransaction } from '../interfaces/transaction.interface';

const transactionSchema = new Schema<ITransaction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  merchantId: {
    type: Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true
  },
  offerId: {
    type: Schema.Types.ObjectId,
    ref: 'Offer'
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  description: String,
  billAmount: Number,
  discount: Number
}, {
  timestamps: true
});

// Define indexes
transactionSchema.index({ userId: 1 });
transactionSchema.index({ merchantId: 1 });
transactionSchema.index({ reference: 1 }, { unique: true });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);