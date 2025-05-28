import { z } from 'zod';

// Base schemas
//const passwordSchema = z.string().min(6, 'Password must be at least 6 characters long');
//const emailSchema = z.string().email('Invalid email address');

// Request DTOs
export const CreateUserDto = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  gender: z.enum(['M', 'F', 'O'], {
    errorMap: () => ({ message: 'Gender must be M, F, or O' })
  }),
  dob: z.string().transform((str) => {
    // Check if the string matches dd/mm/yyyy format
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = str.match(dateRegex);
    
    if (!match) {
      throw new Error('Date must be in DD/MM/YYYY format (e.g., 01/01/1990)');
    }

    const [_, day, month, year] = match;
    
    // Validate day
    const dayNum = parseInt(day);
    if (dayNum < 1 || dayNum > 31) {
      throw new Error('Day must be between 01 and 31');
    }
    
    // Validate month
    const monthNum = parseInt(month);
    if (monthNum < 1 || monthNum > 12) {
      throw new Error('Month must be between 01 and 12');
    }
    
    // Validate year
    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear();
    if (yearNum < 1900 || yearNum > currentYear) {
      throw new Error(`Year must be between 1900 and ${currentYear}`);
    }
    
    // Create date and validate it's a real date
    const date = new Date(`${year}-${month}-${day}`);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date. Please provide a valid date');
    }

    return date;
  }),
  profileImage: z.string().optional(),
  membershipType: z.enum(['basic', 'bronze', 'silver', 'gold', 'platinum']).default('bronze')
});

export const UpdateUserDto = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  address: z.string().min(5, 'Address must be at least 5 characters').optional(),
  gender: z.enum(['M', 'F', 'O']).optional(),
  dob: z.string().transform((str) => {
    // Check if the string matches dd/mm/yyyy format
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = str.match(dateRegex);
    
    if (!match) {
      throw new Error('Date must be in DD/MM/YYYY format (e.g., 01/01/1990)');
    }

    const [_, day, month, year] = match;
    
    // Validate day
    const dayNum = parseInt(day);
    if (dayNum < 1 || dayNum > 31) {
      throw new Error('Day must be between 01 and 31');
    }
    
    // Validate month
    const monthNum = parseInt(month);
    if (monthNum < 1 || monthNum > 12) {
      throw new Error('Month must be between 01 and 12');
    }
    
    // Validate year
    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear();
    if (yearNum < 1900 || yearNum > currentYear) {
      throw new Error(`Year must be between 1900 and ${currentYear}`);
    }
    
    // Create date and validate it's a real date
    const date = new Date(`${year}-${month}-${day}`);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date. Please provide a valid date');
    }

    return date;
  }).optional(),
  profileImage: z.string().optional(),
  membershipType: z.enum(['basic', 'bronze', 'silver', 'gold', 'platinum']).optional(),
  resetToken: z.string().optional(),
  resetTokenExpires: z.date().optional()
});

export const LoginUserDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const ForgotPasswordDto = z.object({
  email: z.string().email('Invalid email format')
});

export const ResetPasswordDto = z.object({
  token: z.string(),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const ChangePasswordDto = z.object({
  currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

// Response DTOs
export const UserResponseDto = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  membershipType: z.enum(['basic', 'bronze', 'silver', 'gold', 'platinum']),
  isActive: z.boolean(),
  role: z.literal('user'),
  profileImage: z.string(),
  createdAt: z.date()
});

export type CreateUserDtoType = z.infer<typeof CreateUserDto>;
export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;
export type LoginUserDtoType = z.infer<typeof LoginUserDto>;
export type ForgotPasswordDtoType = z.infer<typeof ForgotPasswordDto>;
export type ResetPasswordDtoType = z.infer<typeof ResetPasswordDto>;
export type ChangePasswordDtoType = z.infer<typeof ChangePasswordDto>;
export type UserResponseDtoType = z.infer<typeof UserResponseDto>; 