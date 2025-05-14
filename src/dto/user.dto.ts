import { z } from 'zod';

// Request DTOs
export const CreateUserDto = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 characters')
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .transform((val) => val.replace(/\s|-|\(|\)/g, '')), // Remove spaces, hyphens, parentheses
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user']).default('user'),
  membershipType: z.enum(['basic', 'bronze', 'silver', 'gold', 'platinum']).default('bronze'),
  address: z.string().min(5),
  gender: z.enum(['M', 'F', '0']),
  dob: z.string().regex(
    /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
    'Date of birth must be in dd/mm/yyyy format'
  ),
});

export const UpdateUserDto = CreateUserDto.partial();

export const LoginUserDto = z.object({
  email: z.string().email(),
  password: z.string().min(6)
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
  createdAt: z.date()
});

export type CreateUserDtoType = z.infer<typeof CreateUserDto>;
export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;
export type LoginUserDtoType = z.infer<typeof LoginUserDto>;
export type UserResponseDtoType = z.infer<typeof UserResponseDto>; 