import { UserRepository } from '../repositories/user.repository';
import { CreateUserDtoType, UpdateUserDtoType, LoginUserDtoType } from '../dto/user.dto';
import { AppError } from '../utils/appError';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../interfaces/user.interface';
import { generateVerificationToken, sendVerificationEmail } from '../utils/emailService'; // adjust import path
import { OTPService } from '../utils/otpService';
import { SMSService } from '../utils/smsService';

type CreateUserWithDateDob = Omit<CreateUserDtoType, 'dob'> & { dob: Date };

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: CreateUserDtoType): Promise<{ user: IUser; token: string }> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }
  
    const { dob, ...rest } = data;
  
    // Convert 'dd/mm/yyyy' to a valid Date object
    const [day, month, year] = dob.split('/');
    const dobAsDate = new Date(`${year}-${month}-${day}`);
  
    // Validate date
    if (isNaN(dobAsDate.getTime())) {
      throw new AppError('Invalid date of birth format', 400);
    }
  
    // Build the user data with dob as Date
    const userPayload: CreateUserWithDateDob = {
      ...rest,
      dob: dobAsDate,
    };
  
    // Create user
    const user = await this.userRepository.create(userPayload);
  
    // Generate tokens
    const token = this.generateToken(user);
    const verificationToken = generateVerificationToken(user._id.toString(), user.role);
  
    // Send verification email
    await sendVerificationEmail(user.email, verificationToken, user.role);
  
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

  async verifyUser(userId: string): Promise<IUser> {
    const user = await this.userRepository.verifyUser(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
  
  async initiateEmailUpdate(userId: string, newEmail: string): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(newEmail);
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    await OTPService.sendOTP('email', userId, newEmail);
  }

  async verifyAndUpdateEmail(userId: string, newEmail: string, otp: string): Promise<IUser> {
    const isValid = await OTPService.verifyOTP('email', userId, otp);
    if (!isValid) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    const user = await this.userRepository.update(userId, { email: newEmail });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async initiateMobileUpdate(userId: string, newMobile: string): Promise<void> {
    // Validate phone number format
    if (!SMSService.validatePhoneNumber(newMobile)) {
      throw new AppError('Invalid phone number format', 400);
    }

    const existingUser = await this.userRepository.findByMobile(newMobile);
    if (existingUser) {
      throw new AppError('Mobile number already registered', 400);
    }

    await OTPService.sendOTP('mobile', userId, newMobile);
  }

  async verifyAndUpdateMobile(userId: string, newMobile: string, otp: string): Promise<IUser> {
    // Validate phone number format
    if (!SMSService.validatePhoneNumber(newMobile)) {
      throw new AppError('Invalid phone number format', 400);
    }

    const isValid = await OTPService.verifyOTP('mobile', userId, otp);
    if (!isValid) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    const user = await this.userRepository.update(userId, { phone: newMobile });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
} 