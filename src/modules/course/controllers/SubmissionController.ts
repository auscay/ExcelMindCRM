import { Request, Response } from 'express';
import { SubmissionService, CreateSubmissionData, UpdateSubmissionData, GradeSubmissionData } from '../services/SubmissionService';
import { AuthenticatedRequest } from '../../../shared/types';

export class SubmissionController {
  private submissionService: SubmissionService;

  constructor() {
    this.submissionService = new SubmissionService();
  }

  submit = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }
      const data: CreateSubmissionData = {
        assignmentId: req.body.assignmentId,
        studentId: req.user.id,
        contentText: req.body.contentText,
        fileUrl: (req as any).file?.path || req.body.fileUrl,
        fileName: (req as any).file?.originalname || req.body.fileName,
      };
      const submission = await this.submissionService.createSubmission(data);
      res.status(201).json({ success: true, data: { submission } });
    } catch (error) {
      res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Failed to submit assignment' });
    }
  };

  update = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }
      const id = parseInt(req.params.id);
      const data: UpdateSubmissionData = {
        contentText: req.body.contentText,
        fileUrl: (req as any).file?.path || req.body.fileUrl,
        fileName: (req as any).file?.originalname || req.body.fileName,
      };
      const submission = await this.submissionService.updateSubmission(id, data, req.user.id);
      res.json({ success: true, data: { submission } });
    } catch (error) {
      res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Failed to update submission' });
    }
  };

  grade = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }
      const id = parseInt(req.params.id);
      const data: GradeSubmissionData = {
        grade: req.body.grade,
        feedback: req.body.feedback,
        gradedBy: req.user.id,
      };
      const submission = await this.submissionService.gradeSubmission(id, data, req.user.id);
      res.json({ success: true, message: 'Submission graded', data: { submission } });
    } catch (error) {
      res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Failed to grade submission' });
    }
  };

  listByAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
      const assignmentId = parseInt(req.params.assignmentId);
      const submissions = await this.submissionService.getSubmissionsByAssignment(assignmentId);
      res.json({ success: true, data: { submissions } });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch submissions' });
    }
  };

  mySubmissions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }
      const submissions = await this.submissionService.getMySubmissions(req.user.id);
      res.json({ success: true, data: { submissions } });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch your submissions' });
    }
  };
}


