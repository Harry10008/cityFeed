import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import path from 'path';
import connectDB from '../src/config/database';
import { errorHandler } from '../src/middleware/errorHandler';
import { logError } from '../src/utils/logger';
import merchantRoutes from '../src/routes/merchant.routes';
import userRoutes from '../src/routes/user.routes';
import adminRoutes from '../src/routes/admin.routes';
import couponRoutes from '../src/routes/coupon.routes';
import reviewRoutes from '../src/routes/review.routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../src/config/swagger';

// Load environment variables
config();

// Create Express app
const app = express();

// Basic error handling for initialization
try {
  // Connect to MongoDB
  connectDB().catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });

  // Middleware
  app.use(cors());
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  });

  // Routes
  app.use('/api/merchants', merchantRoutes);
  app.use('/api/users', userRoutes);
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

} catch (error) {
  console.error('Error during app initialization:', error);
}

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  logError(error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  logError(error as Error);
});

// Export the Express API
export default app; 