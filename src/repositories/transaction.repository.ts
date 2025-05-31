import { Types } from 'mongoose';
import { Transaction } from '../models/transaction.model';
import { Wallet } from '../models/wallet.model';
import { ITransaction } from '../interfaces/wallet.interface';
import { AppError } from '../utils/appError';

export class TransactionRepository {
  async createTransaction(data: {
    userId: Types.ObjectId;
    merchantId: Types.ObjectId;
    offerId: Types.ObjectId;
    billAmount: number;
    discount: number;
    coinsPaid: number;
  }): Promise<ITransaction> {
    try {
      // Check if user has sufficient balance
      const wallet = await Wallet.findOne({ userId: data.userId });
      if (!wallet || wallet.balance < data.coinsPaid) {
        throw new AppError('Insufficient balance', 400);
      }

      // Create transaction
      const transaction = await Transaction.create({
        ...data,
        status: 'completed',
        transactionDate: new Date()
      });

      // Update wallet balance
      await Wallet.findOneAndUpdate(
        { userId: data.userId },
        { $inc: { balance: -data.coinsPaid } }
      );

      return transaction;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Error creating transaction', 500);
    }
  }

  async getTransactions(userId: Types.ObjectId): Promise<ITransaction[]> {
    try {
      return await Transaction.find({ userId })
        .populate('merchantId', 'businessName')
        .populate('offerId', 'title')
        .sort({ transactionDate: -1 });
    } catch (error) {
      throw new AppError('Error fetching transactions', 500);
    }
  }

  async getMerchantTransactions(merchantId: Types.ObjectId): Promise<ITransaction[]> {
    try {
      return await Transaction.find({ merchantId })
        .populate('userId', 'fullName')
        .populate('offerId', 'title')
        .sort({ transactionDate: -1 });
    } catch (error) {
      throw new AppError('Error fetching merchant transactions', 500);
    }
  }
}