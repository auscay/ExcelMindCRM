import { body, param, query } from 'express-validator';

export const validateCreateEnrollment = [
  body('courseId')
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
];

export const validateUpdateEnrollment = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Enrollment ID must be a positive integer'),
  
  body('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'dropped'])
    .withMessage('Status must be pending, approved, rejected, or dropped'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
];

export const validateEnrollmentId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Enrollment ID must be a positive integer')
];

export const validateEnrollmentCourseId = [
  param('courseId')
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer')
];

export const validateEnrollmentFilters = [
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'dropped'])
    .withMessage('Status must be pending, approved, rejected, or dropped'),
  
  query('studentId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Student ID must be a positive integer'),
  
  query('courseId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export const validateRejectEnrollment = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Enrollment ID must be a positive integer'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
];

export const validateBulkEnrollmentAction = [
  body('enrollmentIds')
    .isArray({ min: 1 })
    .withMessage('enrollmentIds must be a non-empty array'),
  
  body('enrollmentIds.*')
    .isInt({ min: 1 })
    .withMessage('Each enrollment ID must be a positive integer'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
];
