import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authenticateToken, requireAdmin, requireLecturer, requireStudent } from '../../auth';

const router = Router();
const dashboardController = new DashboardController();

// Student dashboard
router.get('/student', authenticateToken, requireStudent, dashboardController.getStudentDashboard);

// Lecturer dashboard
router.get('/lecturer', authenticateToken, requireLecturer, dashboardController.getLecturerDashboard);

// Admin dashboard
router.get('/admin', authenticateToken, requireAdmin, dashboardController.getAdminDashboard);

// Role-based dashboard (automatically redirects based on user role)
router.get('/my-dashboard', authenticateToken, dashboardController.getMyDashboard);

export default router;
