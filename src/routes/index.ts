import { Router } from 'express';
import { authRoutes } from '../modules/auth';
import { dashboardRoutes } from '../modules/dashboard';
import { courseRoutes, enrollmentRoutes, assignmentRoutes, submissionRoutes } from '../modules/course';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ExcelMind CRM API is running',
    data: {
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

// Module routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/submissions', submissionRoutes);

export default router;