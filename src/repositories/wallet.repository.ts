import { Types } from 'mongoose';
import { Wallet } from '../models/wallet.model';
import { WalletTransaction } from '../models/walletTransaction.model';
import { IWallet, IWalletTransaction } from '../interfaces/wallet.interface';
import { AppError } from '../utils/appError';

export class WalletRepository {
  async createWallet(userId: Types.ObjectId): Promise<IWallet> {
    try {
      const wallet = await Wallet.create({ userId });
      return wallet;
    } catch (error) {
      throw new AppError('Error creating wallet', 500);
    }
  }

  async getWalletByUserId(userId: Types.ObjectId): Promise<IWallet | null> {
    try {
      return await Wallet.findOne({ userId });
    } catch (error) {
      throw new AppError('Error finding wallet', 500);
    }
  }

  async addCoins(userId: Types.ObjectId, data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    amount: number;
    coinsAdded: number;
  }): Promise<IWalletTransaction> {
    try {
      const transaction = await WalletTransaction.create({
        userId,
        ...data,
        type: 'credit',
        status: 'success'
      });

      await Wallet.findOneAndUpdate(
        { userId },
        {
          $inc: { balance: data.coinsAdded },
          $push: { transactions: transaction._id }
        }
      );

      return transaction;
    } catch (error) {
      throw new AppError('Error adding coins', 500);
    }
  }

  async getTransactions(userId: Types.ObjectId): Promise<IWalletTransaction[]> {
    try {
      return await WalletTransaction.find({ userId })
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new AppError('Error fetching transactions', 500);
    }
  }
}