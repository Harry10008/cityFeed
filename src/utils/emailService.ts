import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AppError } from './appError';

dotenv.config();

// Debug logging for environment variables
console.log('Email Configuration Check:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not Set');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not Set');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL ? 'Set' : 'Not Set');

// Validate email configuration
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('Email configuration is missing. Please check your .env file.');
  console.error('Required environment variables:');
  console.error('- EMAIL_USER: Your Gmail address');
  console.error('- EMAIL_PASSWORD: Your Gmail app password');
  console.error('- FRONTEND_URL: Your frontend application URL');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify email configuration
transporter.verify((error) => {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Generate verification token
export const generateVerificationToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Send verification email
export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  // Debug logging before check
  console.log('Checking email configuration in sendVerificationEmail:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not Set');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not Set');
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL ? 'Set' : 'Not Set');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || !process.env.FRONTEND_URL) {
    console.error('Missing environment variables:');
    if (!process.env.EMAIL_USER) console.error('- EMAIL_USER is missing');
    if (!process.env.EMAIL_PASSWORD) console.error('- EMAIL_PASSWORD is missing');
    if (!process.env.FRONTEND_URL) console.error('- FRONTEND_URL is missing');
    throw new AppError('Email configuration is incomplete. Please check your .env file.', 500);
  }

  const mailOptions = {
    from: `"CityFeed" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'CityFeed - Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #333;">CityFeed</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-bottom: 15px;">Verify Your Email</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Thank you for registering with CityFeed! Please click the button below to verify your email address:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}" 
               style="background-color: #4CAF50; color: white; padding: 15px 25px; text-decoration: none; 
                      border-radius: 5px; font-weight: bold; display: inline-block;">
              Verify Email
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            This verification link will expire in <strong>24 hours</strong>
          </p>
        </div>
        
        <div style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
          <p>If you did not create an account with CityFeed, please ignore this email.</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} CityFeed. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `CityFeed - Verify Your Email

Thank you for registering with CityFeed! Please click the link below to verify your email address:

${process.env.FRONTEND_URL}/verify-email?token=${token}

This verification link will expire in 24 hours.

If you did not create an account with CityFeed, please ignore this email.

© ${new Date().getFullYear()} CityFeed. All rights reserved.`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent successfully to: ${email}`);
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new AppError('Failed to send verification email. Please try again later.', 500);
  }
};

// Verify token
export const verifyToken = (token: string): { userId: string; role: string } => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string; role: string };
    return { userId: decoded.userId, role: decoded.role };
  } catch (error) {
    throw new AppError('Invalid or expired token', 400);
  }
}; 