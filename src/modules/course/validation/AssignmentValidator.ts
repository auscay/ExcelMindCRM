import { body } from 'express-validator';

export const createAssignmentRules = [
  body('courseId').isInt({ gt: 0 }).withMessage('courseId is required'),
  body('title').isString().notEmpty().withMessage('title is required'),
  body('weight').isInt({ min: 0, max: 100 }).withMessage('weight must be 0-100'),
  body('description').optional().isString(),
  body('dueAt').optional().isISO8601().toDate(),
  body('isActive').optional().isBoolean(),
];

export const updateAssignmentRules = [
  body('title').optional().isString().notEmpty(),
  body('weight').optional().isInt({ min: 0, max: 100 }),
  body('description').optional().isString(),
  body('dueAt').optional({ nullable: true }).isISO8601().toDate(),
  body('isActive').optional().isBoolean(),
];


