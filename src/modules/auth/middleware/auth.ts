import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { UserRole, AuthenticatedRequest } from '../../../shared/types';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ 
        success: false,
        error: 'Access token required' 
      });
      return;
    }

    const authService = new AuthService();
    const payload = authService.verifyToken(token);
    
    // Get user from database to ensure they still exist and are active
    const user = await authService.getUserById(payload.userId);
    
    if (!user || !user.isActive) {
      res.status(401).json({ 
        success: false,
        error: 'Invalid or inactive user' 
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    res.status(401).json({ 
      success: false,
      error: 'Invalid or expired token' 
    });
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false,
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
      return;
    }

    next();
  };
};

// Convenience middleware for specific roles
export const requireAdmin = requireRole([UserRole.ADMIN]);
export const requireLecturer = requireRole([UserRole.LECTURER, UserRole.ADMIN]);
export const requireStudent = requireRole([UserRole.STUDENT, UserRole.LECTURER, UserRole.ADMIN]);
