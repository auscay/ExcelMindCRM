import { Router } from 'express';
import { AssignmentController } from '../controllers/AssignmentController';
import { authenticateToken, requireLecturer } from '../../auth';
import { createAssignmentRules, updateAssignmentRules, handleValidationErrors } from '../validation';

const router = Router();
const controller = new AssignmentController();

router.get('/course/:courseId', authenticateToken, controller.listForCourse);
router.get('/:id', authenticateToken, controller.getById);
router.post('/', authenticateToken, requireLecturer, createAssignmentRules, handleValidationErrors, controller.create);
router.put('/:id', authenticateToken, requireLecturer, updateAssignmentRules, handleValidationErrors, controller.update);
router.delete('/:id', authenticateToken, requireLecturer, controller.remove);

export default router;


