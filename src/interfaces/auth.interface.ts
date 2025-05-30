import { Request } from 'express';

export interface AuthUser {
  id: string;
  role: string;
  isVerified: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
} 