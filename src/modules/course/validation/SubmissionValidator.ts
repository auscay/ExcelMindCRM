import { body } from 'express-validator';

export const createSubmissionRules = [
  body('assignmentId').isInt({ gt: 0 }).withMessage('assignmentId is required'),
  body('contentText').optional().isString(),
  body('fileUrl').optional().isString(),
  body('fileName').optional().isString(),
];

export const updateSubmissionRules = [
  body('contentText').optional({ nullable: true }).isString(),
  body('fileUrl').optional({ nullable: true }).isString(),
  body('fileName').optional({ nullable: true }).isString(),
];

export const gradeSubmissionRules = [
  body('grade').isInt({ min: 0, max: 100 }).withMessage('grade must be 0-100'),
  body('feedback').optional().isString(),
];


