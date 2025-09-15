import { Response } from 'express';
import { AuthenticatedRequest } from '../../../shared/types';

export class DashboardController {
  getStudentDashboard = (req: AuthenticatedRequest, res: Response): void => {
    res.json({
      success: true,
      message: 'Welcome to Student Dashboard',
      data: {
        user: req.user,
        dashboard: {
          type: 'student',
          features: [
            'View courses',
            'Submit assignments',
            'View grades',
            'Access course materials'
          ]
        }
      }
    });
  };

  getLecturerDashboard = (req: AuthenticatedRequest, res: Response): void => {
    res.json({
      success: true,
      message: 'Welcome to Lecturer Dashboard',
      data: {
        user: req.user,
        dashboard: {
          type: 'lecturer',
          features: [
            'Manage courses',
            'Grade assignments',
            'View student progress',
            'Upload course materials',
            'Create assignments'
          ]
        }
      }
    });
  };

  getAdminDashboard = (req: AuthenticatedRequest, res: Response): void => {
    res.json({
      success: true,
      message: 'Welcome to Admin Dashboard',
      data: {
        user: req.user,
        dashboard: {
          type: 'admin',
          features: [
            'Manage users',
            'System configuration',
            'View analytics',
            'Manage courses',
            'User role management',
            'System monitoring'
          ]
        }
      }
    });
  };

  getMyDashboard = (req: AuthenticatedRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false,
        error: 'User not authenticated' 
      });
      return;
    }

    const { role } = req.user;
    
    switch (role) {
      case 'student':
        return this.getStudentDashboard(req, res);
      case 'lecturer':
        return this.getLecturerDashboard(req, res);
      case 'admin':
        return this.getAdminDashboard(req, res);
      default:
        res.status(403).json({ 
          success: false,
          error: 'Invalid user role' 
        });
    }
  };
}
