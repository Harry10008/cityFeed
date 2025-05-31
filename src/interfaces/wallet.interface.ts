import { Document, Types } from 'mongoose';
// import { ITransaction } from './transaction.interface';

export interface IWallet extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  balance: number;
  currency: string;
  transactions: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IWalletTransaction extends Document {
  userId: Types.ObjectId;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: number;
  coinsAdded: number;
  status: 'pending' | 'success' | 'failed';
  type: 'credit' | 'debit';
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  merchantId: Types.ObjectId;
  offerId: Types.ObjectId;
  billAmount: number;
  discount: number;
  coinsPaid: number;
  transactionDate: Date;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}