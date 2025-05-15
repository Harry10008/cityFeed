import { z } from 'zod';

// Request DTOs
export const CreateAdminDto = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10),
  address: z.string().min(5),
  permissions: z.array(z.string()).default([])
});

export const UpdateAdminDto = CreateAdminDto.partial();

export const LoginAdminDto = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const EmailUpdateDto = z.object({
  newEmail: z.string().email()
});

export const VerifyEmailDto = z.object({
  newEmail: z.string().email(),
  otp: z.string().length(6)
});

// Response DTOs
export const AdminResponseDto = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  permissions: z.array(z.string()),
  isActive: z.boolean(),
  isVerified: z.boolean(),
  role: z.literal('admin'),
  createdAt: z.date()
});

export type CreateAdminDtoType = z.infer<typeof CreateAdminDto>;
export type UpdateAdminDtoType = z.infer<typeof UpdateAdminDto>;
export type LoginAdminDtoType = z.infer<typeof LoginAdminDto>;
export type EmailUpdateDtoType = z.infer<typeof EmailUpdateDto>;
export type VerifyEmailDtoType = z.infer<typeof VerifyEmailDto>;
export type AdminResponseDtoType = z.infer<typeof AdminResponseDto>; 