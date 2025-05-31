import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { Transaction } from '../models/transaction.model';
import { Types } from 'mongoose';

export class TransactionController {
  // Get all transactions
  getAllTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transactions = await Transaction.find({ userId: req.user._id })
        .populate('merchantId', 'businessName')
        .sort({ createdAt: -1 });

      res.status(200).json({
        status: 'success',
        data: transactions
      });
    } catch (error) {
      next(error);
    }
  };

  // Get transaction by ID
  getTransactionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transaction = await Transaction.findOne({
        _id: new Types.ObjectId(req.params.id),
        userId: req.user._id
      }).populate('merchantId', 'businessName');

      if (!transaction) {
        throw new AppError('Transaction not found', 404);
      }

      res.status(200).json({
        status: 'success',
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  };

  // Create new transaction
  createTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { merchantId, amount, type, description } = req.body;

      const transaction = await Transaction.create({
        userId: req.user._id,
        merchantId,
        amount,
        type,
        description,
        reference: `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      });

      res.status(201).json({
        status: 'success',
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  };
}