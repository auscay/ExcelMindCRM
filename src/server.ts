import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { initializeDatabase, errorHandler, notFoundHandler, requestLogger } from './shared';
import routes from './routes';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(requestLogger);

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ExcelMind CRM API',
    data: {
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        auth: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          profile: 'GET /api/auth/profile',
          verify: 'GET /api/auth/verify'
        },
        dashboard: {
          student: 'GET /api/dashboard/student',
          lecturer: 'GET /api/dashboard/lecturer',
          admin: 'GET /api/dashboard/admin',
          myDashboard: 'GET /api/dashboard/my-dashboard'
        },
        courses: {
          list: 'GET /api/courses',
          published: 'GET /api/courses/published',
          create: 'POST /api/courses',
          getById: 'GET /api/courses/:id',
          update: 'PUT /api/courses/:id',
          updateStatus: 'PATCH /api/courses/:id/status',
          uploadSyllabus: 'POST /api/courses/:id/syllabus',
          delete: 'DELETE /api/courses/:id',
          myCourses: 'GET /api/courses/lecturer/my-courses',
          lecturerCourses: 'GET /api/courses/lecturer/:lecturerId'
        },
        enrollments: {
          enroll: 'POST /api/enrollments/enroll',
          myEnrollments: 'GET /api/enrollments/my-enrollments',
          list: 'GET /api/enrollments',
          pending: 'GET /api/enrollments/pending',
          courseEnrollments: 'GET /api/enrollments/course/:courseId',
          getById: 'GET /api/enrollments/:id',
          update: 'PATCH /api/enrollments/:id',
          approve: 'PATCH /api/enrollments/:id/approve',
          reject: 'PATCH /api/enrollments/:id/reject',
          drop: 'PATCH /api/enrollments/:id/drop',
          bulkApprove: 'PATCH /api/enrollments/bulk-approve',
          bulkReject: 'PATCH /api/enrollments/bulk-reject'
        }
      }
    }
  });
});

// Error handling middleware
// app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    //log env variables
    // Initialize database connection
    await initializeDatabase();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📁 Modular structure: Auth, Dashboard & Course modules loaded`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();