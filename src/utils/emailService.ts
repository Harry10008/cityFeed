import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
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
export const sendVerificationEmail = async (email: string, token: string, role: string): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}&role=${role}`;
  
  const mailOptions = {
    from: `"CityFeed" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your CityFeed Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #333;">Welcome to CityFeed!</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Thank you for registering with CityFeed. To complete your registration and start using our services, 
            please verify your email address by clicking the button below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; 
                      border-radius: 4px; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If the button above doesn't work, you can also copy and paste this link into your browser:
          </p>
          <p style="color: #666; font-size: 14px; word-break: break-all;">
            <a href="${verificationUrl}" style="color: #4CAF50;">${verificationUrl}</a>
          </p>
        </div>
        
        <div style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
          <p>This verification link will expire in 24 hours.</p>
          <p>If you did not create an account with CityFeed, please ignore this email.</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} CityFeed. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Welcome to CityFeed!

Thank you for registering with CityFeed. To complete your registration and start using our services, 
please verify your email address by clicking the link below:

${verificationUrl}

This verification link will expire in 24 hours.

If you did not create an account with CityFeed, please ignore this email.

© ${new Date().getFullYear()} CityFeed. All rights reserved.`
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Verify token
export const verifyToken = (token: string): { userId: string; role: string } => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string; role: string };
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired verification token');
  }
}; 