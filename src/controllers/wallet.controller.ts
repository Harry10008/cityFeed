import { Request, Response } from 'express';
import { WalletRepository } from '../repositories/wallet.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { AppError } from '../utils/appError';
import { AddCoinsDto } from '../dto/wallet.dto';
import { Types } from 'mongoose';
import { ITransaction } from '../interfaces/transaction.interface';

export class WalletController {
  private walletRepository: WalletRepository;
  private transactionRepository: TransactionRepository;

  constructor() {
    this.walletRepository = new WalletRepository();
    this.transactionRepository = new TransactionRepository();
  }

  public createWallet = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const wallet = await this.walletRepository.createWallet(userId);
      res.status(201).json({
        status: 'success',
        data: wallet
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: 'error',
          message: error.message
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: 'Internal server error'
        });
      }
    }
  };

  public getBalance = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const wallet = await this.walletRepository.getWalletByUserId(userId);
      if (!wallet) {
        throw new AppError('Wallet not found', 404);
      }

      res.status(200).json({
        status: 'success',
        data: {
          balance: wallet.balance,
          currency: wallet.currency
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: 'error',
          message: error.message
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: 'Internal server error'
        });
      }
    }
  };

  public getTransactions = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const transactions = await this.transactionRepository.getTransactionsByUserId(userId);
      res.status(200).json({
        status: 'success',
        data: transactions
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: 'error',
          message: error.message
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: 'Internal server error'
        });
      }
    }
  };

  public addCoins = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const addCoinsDto = req.body as AddCoinsDto;
      const result = await this.walletRepository.addCoins(userId, addCoinsDto.amount);

      res.status(200).json({
        status: 'success',
        data: {
          wallet: result.wallet,
          transaction: result.transaction
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: 'error',
          message: error.message
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: 'Internal server error'
        });
      }
    }
  };

  public createTransaction = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const { merchantId, amount, type, description } = req.body;
      
      const result = await this.transactionRepository.createTransaction({
        userId,
        merchantId: new Types.ObjectId(merchantId),
        amount,
        type,
        description
      });

      res.status(201).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: 'error',
          message: error.message
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: 'Internal server error'
        });
      }
    }
  };

  public getMerchantTransactions = async (req: Request, res: Response) => {
    try {
      const merchantId = req.user?._id;
      if (!merchantId) {
        throw new AppError('Merchant not authenticated', 401);
      }

      const transactions = await this.transactionRepository.getTransactionsByMerchantId(merchantId);
      res.status(200).json({
        status: 'success',
        data: transactions
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: 'error',
          message: error.message
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: 'Internal server error'
        });
      }
    }
  };
}