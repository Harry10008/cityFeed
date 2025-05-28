import { UserRepository } from '../repositories/user.repository';
import { CreateUserDtoType, UpdateUserDtoType, LoginUserDtoType } from '../dto/user.dto';
import { AppError } from '../utils/appError';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../interfaces/user.interface';
import { generateVerificationToken, sendVerificationEmail } from '../utils/emailService';
import { OTPService } from '../utils/otpService';
import { SMSService } from '../utils/smsService';
import { User } from '../models/user.model';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

type CreateUserWithDateDob = Omit<CreateUserDtoType, 'dob' | 'gender'> & { 
  dob: Date;
  gender?: 'male' | 'female' | 'other';
};

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: CreateUserDtoType): Promise<{ user: IUser; token: string }> {
    try {
      // Check if email already exists
      const existingEmailUser = await User.findOne({ email: data.email });
      if (existingEmailUser) {
        throw new AppError('Email already registered', 400);
      }

      // Check if phone already exists
      const existingPhoneUser = await User.findOne({ phone: data.phone });
      if (existingPhoneUser) {
        throw new AppError('Phone number already registered', 400);
      }

      const { dob, gender, ...rest } = data;
    
      // Convert 'dd/mm/yyyy' to a valid Date object
      const [day, month, year] = dob.split('/');
      const dobAsDate = new Date(`${year}-${month}-${day}`);
    
      // Validate date
      if (isNaN(dobAsDate.getTime())) {
        throw new AppError('Invalid date of birth format', 400);
      }

      // Map gender values
      let mappedGender: 'male' | 'female' | 'other' | undefined;
      if (gender) {
        switch (gender) {
          case 'M':
            mappedGender = 'male';
            break;
          case 'F':
            mappedGender = 'female';
            break;
          case '0':
            mappedGender = 'other';
            break;
          default:
            mappedGender = undefined;
        }
      }
    
      // Build the user data with dob as Date
      const userPayload: CreateUserWithDateDob = {
        ...rest,
        dob: dobAsDate,
        gender: mappedGender
      };
    
      // Create user
      const user = await this.userRepository.create(userPayload);
    
      // Generate tokens
      const token = this.generateToken(user);
      const verificationToken = generateVerificationToken(user._id.toString(), user.role);
    
      // Send verification email
      await sendVerificationEmail(user.email, verificationToken, user.role);
    
      return { user, token };
    } catch (error) {
      // Handle mongoose duplicate key error
      if (error.code === 11000) {
        if (error.keyPattern?.email) {
          throw new AppError('Email already registered', 400);
        }
        if (error.keyPattern?.phone) {
          throw new AppError('Phone number already registered', 400);
        }
      }
      throw error;
    }
  }
  
  async login(data: LoginUserDtoType): Promise<{ user: IUser; token: string }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if email is verified
    if (!user.isVerified) {
      // Resend verification email
      const verificationToken = generateVerificationToken(user._id.toString(), user.role);
      await sendVerificationEmail(user.email, verificationToken, user.role);
      
      throw new AppError('Please verify your email to login. A new verification email has been sent.', 401);
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
    const payload = { 
      id: user._id, 
      role: user.role,
      isVerified: user.isVerified 
    };
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    const options: SignOptions = { expiresIn: '7d' };
    
    return jwt.sign(payload, secret, options);
  }

  async verifyUser(userId: string): Promise<IUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    if (user.isVerified) {
      throw new AppError('Email already verified', 400);
    }
    
    user.isVerified = true;
    await user.save();
    
    return user;
  }
  
  async initiateEmailUpdate(userId: string, newEmail: string): Promise<void> {
    // Check if user exists and is verified
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Check if user's email is verified
    if (!user.isVerified) {
      throw new AppError('Please verify your current email before updating to a new one', 400);
    }
    
    // Check if new email is already registered
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
    // Check if user exists and is verified
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Check if user's email is verified
    if (!user.isVerified) {
      throw new AppError('Please verify your email before updating your phone number', 400);
    }
    
    // Validate phone number format
    if (!SMSService.validatePhoneNumber(newMobile)) {
      throw new AppError('Invalid phone number format', 400);
    }

    const existingUser = await this.userRepository.findByMobile(newMobile);
    if (existingUser) {
      throw new AppError('Mobile number already registered', 400);
    }

    try {
      await OTPService.sendOTP('mobile', userId, newMobile);
    } catch (error: any) {
      // Handle SMS-specific errors
      if (error.message.includes('region') || error.message.includes('geographic')) {
        // In development, log the error but continue
        if (process.env.NODE_ENV === 'development') {
          console.log(`[DEV MODE] SMS failed for ${newMobile}. Check logs for OTP.`);
          return;
        }
      }
      throw error;
    }
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

  async create(data: CreateUserDtoType): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return User.create({ ...data, password: hashedPassword });
  }

  async findByEmail(email: string): Promise<(IUser & { _id: Types.ObjectId }) | null> {
    return User.findOne({ email }).select('+password') as Promise<(IUser & { _id: Types.ObjectId }) | null>;
  }

  async findById(id: string): Promise<(IUser & { _id: Types.ObjectId }) | null> {
    return User.findById(id).select('+password') as Promise<(IUser & { _id: Types.ObjectId }) | null>;
  }

  async findByResetToken(token: string): Promise<(IUser & { _id: Types.ObjectId }) | null> {
    return User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() }
    }).select('+password') as Promise<(IUser & { _id: Types.ObjectId }) | null>;
  }

  async update(id: string, data: Partial<UpdateUserDtoType>): Promise<(IUser & { _id: Types.ObjectId }) | null> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true }) as Promise<(IUser & { _id: Types.ObjectId }) | null>;
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
} 