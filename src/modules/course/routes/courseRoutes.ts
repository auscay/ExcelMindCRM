import { Router } from 'express';
import { CourseController } from '../controllers/CourseController';
import { authenticateToken, requireLecturer, requireAdmin } from '../../auth';
import { 
  validateCreateCourse, 
  validateUpdateCourse, 
  validateCourseId, 
  validateCourseStatus,
  validateCourseFilters,
  validateLecturerId,
  handleValidationErrors 
} from '../validation';
import { uploadSyllabus, handleFileUploadError } from '../middleware/fileUpload';

const router = Router();
const courseController = new CourseController();

// Test route to verify routing is working
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Course routes are working!' });
});

// Public routes
router.get('/published', courseController.getPublishedCourses);


// Protected routes - All authenticated users
router.get('/', validateCourseFilters, handleValidationErrors, courseController.getCourses);

// Lecturer-specific routes (must come before parameterized routes)
router.get('/lecturer/my-courses', 
  authenticateToken, 
  requireLecturer, 
  courseController.getCoursesByLecturer
);

// Admin routes (must come before parameterized routes)
router.get('/lecturer/:lecturerId', 
  authenticateToken, 
  requireAdmin, 
  validateLecturerId, 
  handleValidationErrors, 
  courseController.getCoursesByLecturer
);

// Parameterized routes (must come after all specific routes)
router.get('/:id', validateCourseId, handleValidationErrors, courseController.getCourseById);

// Lecturer and Admin routes
router.post('/', 
  authenticateToken, 
  requireLecturer, 
  validateCreateCourse, 
  handleValidationErrors, 
  courseController.createCourse
);

router.put('/:id', 
  authenticateToken, 
  requireLecturer, 
  validateUpdateCourse, 
  handleValidationErrors, 
  courseController.updateCourse
);

router.patch('/:id/status', 
  authenticateToken, 
  requireLecturer, 
  validateCourseStatus, 
  handleValidationErrors, 
  courseController.updateCourseStatus
);

router.post('/:id/syllabus', 
  authenticateToken, 
  requireLecturer, 
  validateCourseId, 
  handleValidationErrors,
  uploadSyllabus.single('syllabus'),
  handleFileUploadError,
  courseController.uploadSyllabus
);

router.delete('/:id', 
  authenticateToken, 
  requireLecturer, 
  validateCourseId, 
  handleValidationErrors, 
  courseController.deleteCourse
);


export default router;
