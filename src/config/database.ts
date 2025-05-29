import mongoose from 'mongoose';
import { logError } from '../utils/logger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Check if we're already connected
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Add connection options for better reliability
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    logError(error as Error);
    // Don't exit the process, just throw the error
    throw error;
  }
};

export default connectDB; 