import { Router } from 'express';
import { SubmissionController } from '../controllers/SubmissionController';
import { authenticateToken, requireStudent, requireLecturer } from '../../auth';
import { uploadSyllabus } from '../middleware/fileUpload';
import { createSubmissionRules, updateSubmissionRules, gradeSubmissionRules, handleValidationErrors } from '../validation';

const router = Router();
const controller = new SubmissionController();

router.get('/assignment/:assignmentId', authenticateToken, requireLecturer, controller.listByAssignment);
router.get('/me', authenticateToken, requireStudent, controller.mySubmissions);
router.post('/', authenticateToken, requireStudent, uploadSyllabus.single('file'), createSubmissionRules, handleValidationErrors, controller.submit);
router.put('/:id', authenticateToken, requireStudent, uploadSyllabus.single('file'), updateSubmissionRules, handleValidationErrors, controller.update);
router.post('/:id/grade', authenticateToken, requireLecturer, gradeSubmissionRules, handleValidationErrors, controller.grade);

export default router;


