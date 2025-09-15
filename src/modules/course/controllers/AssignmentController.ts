import { Request, Response } from 'express';
import { AssignmentService, CreateAssignmentData, UpdateAssignmentData } from '../services/AssignmentService';
import { AuthenticatedRequest } from '../../../shared/types';

export class AssignmentController {
  private assignmentService: AssignmentService;

  constructor() {
    this.assignmentService = new AssignmentService();
  }

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }
      // Only lecturer (for own course) or admin
      const data = req.body as CreateAssignmentData;
      const assignment = await this.assignmentService.createAssignment(data);
      res.status(201).json({ success: true, data: { assignment } });
    } catch (error) {
      res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Failed to create assignment' });
    }
  };

  update = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }
      const id = parseInt(req.params.id);
      const data = req.body as UpdateAssignmentData;
      const assignment = await this.assignmentService.updateAssignment(id, data);
      res.json({ success: true, data: { assignment } });
    } catch (error) {
      res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Failed to update assignment' });
    }
  };

  listForCourse = async (req: Request, res: Response): Promise<void> => {
    try {
      const courseId = parseInt(req.params.courseId);
      const assignments = await this.assignmentService.getAssignmentsForCourse(courseId);
      res.json({ success: true, data: { assignments } });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch assignments' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const assignment = await this.assignmentService.getAssignmentById(id);
      if (!assignment) {
        res.status(404).json({ success: false, error: 'Assignment not found' });
        return;
      }
      res.json({ success: true, data: { assignment } });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch assignment' });
    }
  };

  remove = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }
      const id = parseInt(req.params.id);
      await this.assignmentService.deleteAssignment(id);
      res.json({ success: true, message: 'Assignment deleted' });
    } catch (error) {
      res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Failed to delete assignment' });
    }
  };
}


