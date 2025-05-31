import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
const walletController = new WalletController();

/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: Wallet management API
 */

/**
 * @swagger
 * /api/v1/wallet:
 *   post:
 *     summary: Create a new wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Wallet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 60d21b4667d0d8992e610c85
 *                     balance:
 *                       type: number
 *                       example: 0
 *                     currency:
 *                       type: string
 *                       example: INR
 *       400:
 *         description: Wallet already exists
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, walletController.createWallet);

/**
 * @swagger
 * /api/v1/wallet/balance:
 *   get:
 *     summary: Get wallet balance
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                       example: 1000
 *                     currency:
 *                       type: string
 *                       example: INR
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wallet not found
 */
router.get('/balance', protect, walletController.getBalance);

/**
 * @swagger
 * /api/v1/wallet/transactions:
 *   get:
 *     summary: Get wallet transactions
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 60d21b4667d0d8992e610c85
 *                       amount:
 *                         type: number
 *                         example: 100
 *                       type:
 *                         type: string
 *                         example: credit
 *                       status:
 *                         type: string
 *                         example: completed
 *       401:
 *         description: Unauthorized
 */
router.get('/transactions', protect, walletController.getTransactions);

/**
 * @swagger
 * /api/v1/wallet/add-coins:
 *   post:
 *     summary: Add coins to wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount of coins to add
 *                 example: 100
 *     responses:
 *       200:
 *         description: Coins added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     wallet:
 *                       type: object
 *                       properties:
 *                         balance:
 *                           type: number
 *                           example: 1000
 *                     transaction:
 *                       type: object
 *                       properties:
 *                         amount:
 *                           type: number
 *                           example: 100
 *       400:
 *         description: Invalid amount or insufficient balance
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wallet not found
 */
router.post('/add-coins', protect, walletController.addCoins);

/**
 * @swagger
 * /api/v1/wallet/transaction:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - merchantId
 *               - amount
 *               - type
 *             properties:
 *               merchantId:
 *                 type: string
 *                 description: ID of the merchant
 *                 example: 60d21b4667d0d8992e610c85
 *               amount:
 *                 type: number
 *                 description: Transaction amount
 *                 example: 100
 *               type:
 *                 type: string
 *                 enum: [credit, debit]
 *                 description: Type of transaction
 *                 example: credit
 *               description:
 *                 type: string
 *                 description: Transaction description
 *                 example: Payment for services
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       type: object
 *                       properties:
 *                         amount:
 *                           type: number
 *                           example: 100
 *                     newBalance:
 *                       type: number
 *                       example: 1000
 *       400:
 *         description: Invalid input or insufficient balance
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wallet not found
 */
router.post('/transaction', protect, walletController.createTransaction);

/**
 * @swagger
 * /api/v1/wallet/merchant/transactions:
 *   get:
 *     summary: Get merchant transactions
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Merchant transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 60d21b4667d0d8992e610c85
 *                       amount:
 *                         type: number
 *                         example: 100
 *                       type:
 *                         type: string
 *                         example: credit
 *                       status:
 *                         type: string
 *                         example: completed
 *       401:
 *         description: Unauthorized
 */
router.get('/merchant/transactions', protect, walletController.getMerchantTransactions);

export default router;