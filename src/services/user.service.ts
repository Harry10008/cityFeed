import { UserRepository } from '../repositories/user.repository';
import { CreateUserDtoType, UpdateUserDtoType, LoginUserDtoType } from '../dto/user.dto';
import { AppError } from '../utils/appError';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../interfaces/user.interface';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: CreateUserDtoType): Promise<{ user: IUser; token: string }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Create new user
    const user = await this.userRepository.create(data);

    // Generate JWT token
    const token = this.generateToken(user);

    return { user, token };
  }

  async login(data: LoginUserDtoType): Promise<{ user: IUser; token: string }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return { user, token };
  }

  async getProfile(userId: string): Promise<IUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updateProfile(userId: string, data: UpdateUserDtoType): Promise<IUser> {
    const user = await this.userRepository.update(userId, data);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updateMembershipType(userId: string, membershipType: 'basic' | 'bronze' | 'silver' | 'gold' | 'platinum'): Promise<IUser> {
    const user = await this.userRepository.updateMembershipType(userId, membershipType);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
  

  private generateToken(user: IUser): string {
    const payload = { id: user._id, role: user.role };
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    const options: SignOptions = { expiresIn: '7d' };
    
    return jwt.sign(payload, secret, options);
  }
} 