import { Router } from 'express';
import { EnrollmentController } from '../controllers/EnrollmentController';
import { authenticateToken, requireStudent, requireLecturer, requireAdmin } from '../../auth';
import { 
  validateCreateEnrollment, 
  validateUpdateEnrollment, 
  validateEnrollmentId, 
  validateEnrollmentCourseId,
  validateEnrollmentFilters,
  validateRejectEnrollment,
  validateBulkEnrollmentAction,
  handleValidationErrors 
} from '../validation';

const router = Router();
const enrollmentController = new EnrollmentController();

// Student routes
router.post('/enroll', 
  authenticateToken, 
  requireStudent, 
  validateCreateEnrollment, 
  handleValidationErrors, 
  enrollmentController.enrollInCourse
);

router.get('/my-enrollments', 
  authenticateToken, 
  requireStudent, 
  enrollmentController.getMyEnrollments
);

router.patch('/:id/drop', 
  authenticateToken, 
  requireStudent, 
  validateEnrollmentId, 
  handleValidationErrors, 
  enrollmentController.dropEnrollment
);

// Lecturer and Admin routes
router.get('/', 
  authenticateToken, 
  requireLecturer, 
  validateEnrollmentFilters, 
  handleValidationErrors, 
  enrollmentController.getEnrollments
);

router.get('/pending', 
  authenticateToken, 
  requireLecturer, 
  enrollmentController.getPendingEnrollments
);

router.get('/course/:courseId', 
  authenticateToken, 
  requireLecturer, 
  validateEnrollmentCourseId, 
  handleValidationErrors, 
  enrollmentController.getCourseEnrollments
);

router.patch('/:id/approve', 
  authenticateToken, 
  requireLecturer, 
  validateEnrollmentId, 
  handleValidationErrors, 
  enrollmentController.approveEnrollment
);

router.patch('/:id/reject', 
  authenticateToken, 
  requireLecturer, 
  validateRejectEnrollment, 
  handleValidationErrors, 
  enrollmentController.rejectEnrollment
);

router.patch('/bulk-approve', 
  authenticateToken, 
  requireLecturer, 
  validateBulkEnrollmentAction, 
  handleValidationErrors, 
  enrollmentController.bulkApproveEnrollments
);

router.patch('/bulk-reject', 
  authenticateToken, 
  requireLecturer, 
  validateBulkEnrollmentAction, 
  handleValidationErrors, 
  enrollmentController.bulkRejectEnrollments
);

// General routes (accessible by all authenticated users)
router.get('/:id', 
  authenticateToken, 
  validateEnrollmentId, 
  handleValidationErrors, 
  enrollmentController.getEnrollmentById
);

router.patch('/:id', 
  authenticateToken, 
  validateUpdateEnrollment, 
  handleValidationErrors, 
  enrollmentController.updateEnrollment
);

// Admin routes (can drop any enrollment)
router.patch('/:id/admin-drop', 
  authenticateToken, 
  requireAdmin, 
  validateEnrollmentId, 
  handleValidationErrors, 
  enrollmentController.dropEnrollment
);

export default router;
