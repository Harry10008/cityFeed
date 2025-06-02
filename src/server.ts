import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
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

// Basic error handling for initialization
const initializeApp = async () => {
  try {
    // Connect to MongoDB with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        await connectDB();
        console.log('MongoDB Connected Successfully');
        break;
      } catch (err) {
        console.error(`MongoDB connection attempt failed. Retries left: ${retries - 1}`);
        retries--;
        if (retries === 0) {
          console.error('Failed to connect to MongoDB after all retries');
          throw err;
        }
        // Wait for 2 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

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
    app.get('/api/health', (_req, res) => {
      const healthInfo = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        mongodb: {
          connected: mongoose.connection.readyState === 1,
          state: mongoose.connection.readyState,
          host: mongoose.connection.host || 'not connected'
        }
      };
      res.status(200).json(healthInfo);
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
};

// Initialize the app
initializeApp().catch(error => {
  console.error('Failed to initialize app:', error);
});

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  logError(error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  logError(error as Error);
});

// Start server
const startServer = async (port: number): Promise<void> => {
  try {
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    // Handle server shutdown gracefully
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying ${port + 1}...`);
      await startServer(port + 1);
    } else {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
};

// Start with initial port
const initialPort = parseInt(process.env.PORT || '3000', 10);
startServer(initialPort).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
}); 