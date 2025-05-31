import mongoose, { Schema } from 'mongoose';
import { IWalletTransaction } from '../interfaces/wallet.interface';

const walletTransactionSchema = new Schema<IWalletTransaction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  coinsAdded: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
walletTransactionSchema.index({ userId: 1, status: 1 });
walletTransactionSchema.index({ razorpayOrderId: 1 }, { unique: true });
walletTransactionSchema.index({ razorpayPaymentId: 1 }, { unique: true });

export const WalletTransaction = mongoose.model<IWalletTransaction>('WalletTransaction', walletTransactionSchema);