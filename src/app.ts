import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { logError } from './utils/logger';
import connectDB from './config/database';
import reviewRoutes from './routes/review.routes';

// Load environment variables
dotenv.config();

// Import routes
import userRoutes from './routes/user.routes';
import merchantRoutes from './routes/merchant.routes';
import adminRoutes from './routes/admin.routes';
import couponRoutes from './routes/coupon.routes';

// Create Express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/users', userRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handling
app.use(errorHandler);

// Unhandled routes
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global error handler
process.on('uncaughtException', (error) => {
  logError(error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logError(error as Error);
  process.exit(1);
});

export default app; 