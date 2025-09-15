import { Request, Response } from 'express';
import { AuthService, RegisterData, LoginData } from '../services/AuthService';
import { UserRole, AuthenticatedRequest } from '../../../shared/types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      const registerData: RegisterData = {
        email,
        password,
        firstName,
        lastName,
        role
      };

      const result = await this.authService.register(registerData);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const loginData: LoginData = { email, password };
      const result = await this.authService.login(loginData);

      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      });
    }
  };

  getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ 
          success: false,
          error: 'User not authenticated' 
        });
        return;
      }

      const user = await this.authService.getUserById(req.user.id);
      if (!user) {
        res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: user.toJSON()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profile'
      });
    }
  };

  verifyToken = (req: AuthenticatedRequest, res: Response): void => {
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: req.user
      }
    });
  };
}
