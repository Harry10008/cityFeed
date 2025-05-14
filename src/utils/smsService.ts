import twilio from 'twilio';
import { AppError } from './appError';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

// Check if we should use mock SMS (for development)
const MOCK_SMS = process.env.NODE_ENV === 'development' && process.env.MOCK_SMS === 'true';

let client: twilio.Twilio | null = null;

if (!MOCK_SMS && accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

export class SMSService {
  static validatePhoneNumber(phone: string): boolean {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if it's a valid length (10-15 digits)
    if (cleaned.length < 10 || cleaned.length > 15) {
      return false;
    }
    
    // For Indian numbers, check if it starts with valid mobile prefixes
    if (cleaned.length === 10) {
      // Indian mobile numbers start with 7, 8, or 9
      return /^[789]/.test(cleaned);
    }
    
    // For international numbers with country code
    if (cleaned.length > 10) {
      return true;
    }
    
    return false;
  }

  static formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If it's a 10-digit number starting with 7, 8, or 9, assume it's Indian
    if (cleaned.length === 10 && /^[789]/.test(cleaned)) {
      cleaned = '91' + cleaned;
    }
    
    // Add + prefix if not present
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  }

  static async sendOTP(phone: string, otp: string): Promise<void> {
    // Validate phone number first
    if (!this.validatePhoneNumber(phone)) {
      throw new AppError('Invalid phone number format', 400);
    }
    
    // Format the phone number
    const formattedPhone = this.formatPhoneNumber(phone);
    
    // Mock SMS in development or when explicitly enabled
    if (MOCK_SMS || !client) {
      console.log(`[MOCK SMS] Sending OTP ${otp} to ${formattedPhone}`);
      console.log(`[MOCK SMS] Message: Your CityFeed OTP is: ${otp}. Valid for 10 minutes.`);
      return;
    }

    try {
      await client.messages.create({
        body: `Your CityFeed OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`,
        from: fromNumber,
        to: formattedPhone
      });
      console.log(`SMS sent successfully to ${formattedPhone}`);
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      
      // In development mode, always log the OTP and return successfully
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV MODE] SMS failed but OTP logged for testing: ${otp}`);
        console.log(`[DEV MODE] Phone: ${formattedPhone}, Error: ${error.message}`);
        return; // Don't throw error in development
      }
      
      // Handle specific Twilio errors for production
      if (error.code === 21408) {
        throw new AppError('SMS service is not available for your region. Please contact support.', 400);
      } else if (error.code === 21212) {
        throw new AppError('SMS service configuration error. Please contact support.', 500);
      } else if (error.code === 21614) {
        throw new AppError('Invalid phone number format', 400);
      } else if (error.code === 21211) {
        throw new AppError('Invalid phone number', 400);
      }
      
      throw new AppError('Failed to send SMS. Please try again later.', 500);
    }
  }

  static async sendSMS(phone: string, message: string): Promise<void> {
    const formattedPhone = this.formatPhoneNumber(phone);
    
    if (MOCK_SMS || !client) {
      console.log(`[MOCK SMS] Sending message to ${formattedPhone}: ${message}`);
      return;
    }

    try {
      await client.messages.create({
        body: message,
        from: fromNumber,
        to: formattedPhone
      });
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV MODE] SMS failed: ${message}`);
        return;
      }
      
      throw new AppError('Failed to send SMS', 500);
    }
  }
} 