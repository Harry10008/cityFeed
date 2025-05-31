// import mongoose, { Schema } from 'mongoose';
// import { IWallet } from '../interfaces/wallet.interface';

// const walletSchema = new Schema<IWallet>({
//   userId: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     unique: true
//   },
//   balance: {
//     type: Number,
//     required: true,
//     default: 0,
//     min: 0
//   },
//   transactions: [{
//     type: Schema.Types.ObjectId,
//     ref: 'WalletTransaction'
//   }]
// }, {
//   timestamps: true
// });

// // Index for efficient querying
// walletSchema.index({ userId: 1 });

// export const Wallet = mongoose.model<IWallet>('Wallet', walletSchema);

import mongoose, { Schema } from 'mongoose';
import { IWallet } from '../interfaces/wallet.interface';

const walletSchema = new Schema<IWallet>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  transactions: [{
    type: Schema.Types.ObjectId,
    ref: 'Transaction'
  }]
}, {
  timestamps: true
});

// Define indexes
walletSchema.index({ userId: 1 }, { unique: true });

export const Wallet = mongoose.model<IWallet>('Wallet', walletSchema);