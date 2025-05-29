import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import path from 'path';
import connectDB from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { logError } from './utils/logger';
import merchantRoutes from './routes/merchant.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import couponRoutes from './routes/coupon.routes';
import reviewRoutes from './routes/review.routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Load environment variables
config();

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

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

// Global error handlers
process.on('uncaughtException', (error) => {
  logError(error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logError(error as Error);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; 