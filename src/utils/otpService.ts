import crypto from 'crypto';
import { redisClient } from '../config/redis';
import { sendOTPEmail } from './emailService';
import { SMSService } from './smsService';
import { AppError } from './appError';

const OTP_EXPIRY = 10 * 60; // 10 minutes in seconds

export class OTPService {
  private static generateOTP(): string {
    // Generate a 6-digit OTP
    return crypto.randomInt(100000, 999999).toString();
  }

  private static getOTPKey(type: 'email' | 'mobile', userId: string): string {
    return `otp:${type}:${userId}`;
  }

  static async generateAndStoreOTP(type: 'email' | 'mobile', userId: string): Promise<string> {
    const otp = this.generateOTP();
    const key = this.getOTPKey(type, userId);
    
    // Store OTP in Redis with expiry
    await redisClient.set(key, otp, 'EX', OTP_EXPIRY);
    
    return otp;
  }

  static async verifyOTP(type: 'email' | 'mobile', userId: string, otp: string): Promise<boolean> {
    const key = this.getOTPKey(type, userId);
    const storedOTP = await redisClient.get(key);
    
    if (!storedOTP) {
      return false; // OTP expired or doesn't exist
    }

    if (storedOTP === otp) {
      // Delete OTP after successful verification
      await redisClient.del(key);
      return true;
    }

    return false;
  }

  static async sendOTP(type: 'email' | 'mobile', userId: string, contact: string): Promise<void> {
    const otp = await this.generateAndStoreOTP(type, userId);
    
    if (type === 'email') {
      await sendOTPEmail(contact, otp, 'email_update');
    } else {
      // Validate phone number before sending
      if (!SMSService.validatePhoneNumber(contact)) {
        throw new AppError('Invalid phone number format', 400);
      }
      
      try {
        await SMSService.sendOTP(contact, otp);
      } catch (error: any) {
        // In development mode, log the OTP for testing
        if (process.env.NODE_ENV === 'development') {
          console.log(`[DEV MODE] SMS OTP for ${contact}: ${otp}`);
        }
        throw error;
      }
    }
  }
} 