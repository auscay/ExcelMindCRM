import { body, param, query } from 'express-validator';

export const validateCreateCourse = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('code')
    .notEmpty()
    .withMessage('Course code is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Course code must be between 3 and 20 characters')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('Course code must contain only uppercase letters, numbers, and hyphens'),
  
  body('credits')
    .isInt({ min: 1, max: 6 })
    .withMessage('Credits must be between 1 and 6'),
  
  body('maxStudents')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max students must be a non-negative integer')
];

export const validateUpdateCourse = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer'),
  
  body('title')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('code')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('Course code must be between 3 and 20 characters')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('Course code must contain only uppercase letters, numbers, and hyphens'),
  
  body('credits')
    .optional()
    .isInt({ min: 1, max: 6 })
    .withMessage('Credits must be between 1 and 6'),
  
  body('maxStudents')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max students must be a non-negative integer'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived')
];

export const validateCourseId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer')
];

export const validateCourseStatus = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived')
];

export const validateCourseFilters = [
  query('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
  
  query('lecturerId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Lecturer ID must be a positive integer'),
  
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export const validateLecturerId = [
  param('lecturerId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Lecturer ID must be a positive integer')
];
