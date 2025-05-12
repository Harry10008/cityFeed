import { z } from 'zod';

// Request DTOs
export const CreateUserDto = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10),
  address: z.string().min(5)
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
  membershipType: z.enum(['basic', 'premium', 'vip']),
  isActive: z.boolean(),
  role: z.literal('user'),
  createdAt: z.date()
});

export type CreateUserDtoType = z.infer<typeof CreateUserDto>;
export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;
export type LoginUserDtoType = z.infer<typeof LoginUserDto>;
export type UserResponseDtoType = z.infer<typeof UserResponseDto>; 