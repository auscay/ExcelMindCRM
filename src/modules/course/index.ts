// Routes
export { default as courseRoutes } from './routes/courseRoutes';
export { default as enrollmentRoutes } from './routes/enrollmentRoutes';
export { default as assignmentRoutes } from './routes/assignmentRoutes';
export { default as submissionRoutes } from './routes/submissionRoutes';

// Services
export { CourseService } from './services/CourseService';
export { EnrollmentService } from './services/EnrollmentService';
export { AssignmentService } from './services/AssignmentService';
export { SubmissionService } from './services/SubmissionService';

// Controllers
export { CourseController } from './controllers/CourseController';
export { EnrollmentController } from './controllers/EnrollmentController';

// Entities
export { Course } from './entities/Course';
export { Enrollment } from './entities/Enrollment';
export { Assignment } from './entities/Assignment';
export { Submission } from './entities/Submission';

// Validation
export * from './validation';

// Middleware
export * from './middleware/fileUpload';
