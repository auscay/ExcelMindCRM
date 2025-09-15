import { Repository } from 'typeorm';
import { AppDataSource } from '../../../shared/config/database';
import { User } from '../entities/User';
import { UserRole, JWTPayload } from '../../../shared/types';
import * as jwt from 'jsonwebtoken';
import { validate } from 'class-validator';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: any;
  token: string;
}

export class AuthService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const user = this.userRepository.create(data);
      
      // Validate user data
      const errors = await validate(user);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.map(e => Object.values(e.constraints || {})).join(', ')}`);
      }

      // Save user to database
      const savedUser = await this.userRepository.save(user);

      // Generate JWT token
      const token = this.generateToken(savedUser);

      return {
        user: savedUser.toJSON(),
        token
      };
    } catch (error) {
      // Re-throw known errors
      if (error instanceof Error) {
        throw error;
      }
      // Handle unexpected errors
      throw new Error('Registration failed due to an unexpected error');
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await this.userRepository.findOne({
        where: { email: data.email }
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Validate password
      const isPasswordValid = await user.validatePassword(data.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        user: user.toJSON(),
        token
      };
    } catch (error) {
      // Re-throw known errors
      if (error instanceof Error) {
        throw error;
      }
      // Handle unexpected errors
      throw new Error('Login failed due to an unexpected error');
    }
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id }
    });
  }

  private generateToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback-secret',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      } as jwt.SignOptions
    );
  }

  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}
