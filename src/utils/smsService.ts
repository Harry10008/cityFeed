import twilio from 'twilio';
import { AppError } from './appError';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.warn('Twilio credentials not found. SMS service will be disabled.');
}

const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null;

export class SMSService {
  static async sendOTP(phoneNumber: string, otp: string): Promise<void> {
    if (!twilioClient) {
      throw new AppError('SMS service is not configured', 500);
    }

    try {
      await twilioClient.messages.create({
        body: `Your CityFeed verification code is: ${otp}. This code will expire in 10 minutes.`,
        from: twilioPhoneNumber,
        to: phoneNumber
      });
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new AppError('Failed to send SMS', 500);
    }
  }

  static validatePhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }
} 