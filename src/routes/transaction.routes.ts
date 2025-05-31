import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
const transactionController = new TransactionController();

/**
 * @swagger
 * /api/v1/transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, transactionController.getAllTransactions);

/**
 * @swagger
 * /api/v1/transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 */
router.get('/:id', protect, transactionController.getTransactionById);

/**
 * @swagger
 * /api/v1/transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
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
 *                 description: Merchant ID
 *               amount:
 *                 type: number
 *                 description: Transaction amount
 *               type:
 *                 type: string
 *                 enum: [credit, debit]
 *                 description: Transaction type
 *               description:
 *                 type: string
 *                 description: Transaction description
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, transactionController.createTransaction);

export default router;