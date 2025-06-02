import nodemailer from 'nodemailer';
import { config } from '../config';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const transporter = nodemailer.createTransport({
  host: config.emailHost,
  port: config.emailPort,
  secure: config.emailSecure,
  auth: {
    user: config.emailUser,
    pass: config.emailPassword,
  },
});

export const sendEmail = async (options: EmailOptions) => {
  const mailOptions = {
    from: `${config.emailFromName} <${config.emailFromAddress}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
}; 