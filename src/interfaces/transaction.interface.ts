import { Types } from 'mongoose';

export interface ITransaction {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  merchantId: Types.ObjectId;
  offerId?: Types.ObjectId;
  amount: number;
  type: 'credit' | 'debit';
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  billAmount?: number;
  discount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionResponse {
  transaction: ITransaction;
  newBalance: number;
}