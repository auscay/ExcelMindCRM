import { Request, Response } from 'express';
import { EnrollmentService, CreateEnrollmentData, UpdateEnrollmentData, EnrollmentFilters } from '../services/EnrollmentService';
import { AuthenticatedRequest } from '../../../shared/types';

export class EnrollmentController {
  private enrollmentService: EnrollmentService;

  constructor() {
    this.enrollmentService = new EnrollmentService();
  }

  // Enroll in a course (Students)
  enrollInCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }
      console.log("req.body", req.body)

      const { courseId, notes } = req.body;

      const enrollmentData: CreateEnrollmentData = {
        studentId: req.user.id,
        courseId,
        notes
      };
      console.log("enrollmentData", enrollmentData)

      const enrollment = await this.enrollmentService.createEnrollment(enrollmentData);

      res.status(201).json({
        success: true,
        message: 'Successfully enrolled in course',
        data: { enrollment: enrollment.toJSON() }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enroll in course'
      });
    }
  };

  // Update enrollment (Students, Lecturers, Admins)
  updateEnrollment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const enrollmentId = parseInt(req.params.id);
      const updateData: UpdateEnrollmentData = req.body;

      const enrollment = await this.enrollmentService.updateEnrollment(enrollmentId, updateData, req.user.id);

      res.json({
        success: true,
        message: 'Enrollment updated successfully',
        data: { enrollment: enrollment.toJSON() }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update enrollment'
      });
    }
  };

  // Get a specific enrollment by ID
  getEnrollmentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const enrollmentId = parseInt(req.params.id);
      const enrollment = await this.enrollmentService.getEnrollmentById(enrollmentId);

      if (!enrollment) {
        res.status(404).json({
          success: false,
          error: 'Enrollment not found'
        });
        return;
      }

      res.json({
        success: true,
        data: { enrollment: enrollment.toJSON() }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch enrollment'
      });
    }
  };

  // Get all enrollments with filters (Admins and Lecturers)
  getEnrollments = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: EnrollmentFilters = {
        status: req.query.status as any,
        studentId: req.query.studentId ? parseInt(req.query.studentId as string) : undefined,
        courseId: req.query.courseId ? parseInt(req.query.courseId as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      };

      const result = await this.enrollmentService.getEnrollments(filters);

      res.json({
        success: true,
        data: {
          enrollments: result.enrollments.map(enrollment => enrollment.toJSON()),
          pagination: {
            page: filters.page || 1,
            limit: filters.limit || 10,
            total: result.total,
            pages: Math.ceil(result.total / (filters.limit || 10))
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch enrollments'
      });
    }
  };

  // Get student's enrollments (Students)
  getMyEnrollments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const enrollments = await this.enrollmentService.getEnrollmentsByStudent(req.user.id);

      res.json({
        success: true,
        data: {
          enrollments: enrollments.map(enrollment => enrollment.toJSON())
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch your enrollments'
      });
    }
  };

  // Get enrollments for a specific course (Lecturers and Admins)
  getCourseEnrollments = async (req: Request, res: Response): Promise<void> => {
    try {
      const courseId = parseInt(req.params.courseId);
      const enrollments = await this.enrollmentService.getEnrollmentsByCourse(courseId);

      res.json({
        success: true,
        data: {
          enrollments: enrollments.map(enrollment => enrollment.toJSON())
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch course enrollments'
      });
    }
  };

  // Get pending enrollments (Admins and Lecturers)
  getPendingEnrollments = async (req: Request, res: Response): Promise<void> => {
    try {
      const enrollments = await this.enrollmentService.getPendingEnrollments();

      res.json({
        success: true,
        data: {
          enrollments: enrollments.map(enrollment => enrollment.toJSON())
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch pending enrollments'
      });
    }
  };

  // Drop enrollment (Students, Lecturers, Admins)
  dropEnrollment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const enrollmentId = parseInt(req.params.id);
      const enrollment = await this.enrollmentService.dropEnrollment(enrollmentId, req.user.id);

      res.json({
        success: true,
        message: 'Successfully dropped enrollment',
        data: { enrollment: enrollment.toJSON() }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to drop enrollment'
      });
    }
  };

  // Approve enrollment (Lecturers and Admins)
  approveEnrollment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const enrollmentId = parseInt(req.params.id);
      const enrollment = await this.enrollmentService.approveEnrollment(enrollmentId, req.user.id);

      res.json({
        success: true,
        message: 'Enrollment approved successfully',
        data: { enrollment: enrollment.toJSON() }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to approve enrollment'
      });
    }
  };

  // Reject enrollment (Lecturers and Admins)
  rejectEnrollment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const enrollmentId = parseInt(req.params.id);
      const { notes } = req.body;

      const enrollment = await this.enrollmentService.rejectEnrollment(enrollmentId, req.user.id, notes);

      res.json({
        success: true,
        message: 'Enrollment rejected successfully',
        data: { enrollment: enrollment.toJSON() }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reject enrollment'
      });
    }
  };

  // Bulk approve enrollments (Lecturers and Admins)
  bulkApproveEnrollments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { enrollmentIds } = req.body;

      if (!Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
        res.status(400).json({
          success: false,
          error: 'enrollmentIds must be a non-empty array'
        });
        return;
      }

      const results: any[] = [];
      const errors: { enrollmentId: any; error: string }[] = [];

      for (const enrollmentId of enrollmentIds) {
        try {
          const enrollment = await this.enrollmentService.approveEnrollment(enrollmentId, req.user.id);
          results.push(enrollment.toJSON());
        } catch (error) {
          errors.push({
            enrollmentId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      res.json({
        success: true,
        message: `Processed ${enrollmentIds.length} enrollments`,
        data: {
          approved: results,
          errors: errors
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process bulk approval'
      });
    }
  };

  // Bulk reject enrollments (Lecturers and Admins)
  bulkRejectEnrollments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { enrollmentIds, notes } = req.body;

      if (!Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
        res.status(400).json({
          success: false,
          error: 'enrollmentIds must be a non-empty array'
        });
        return;
      }

      const results: any[] = [];
      const errors: { enrollmentId: any; error: string }[] = [];

      for (const enrollmentId of enrollmentIds) {
        try {
          const enrollment = await this.enrollmentService.rejectEnrollment(enrollmentId, req.user.id, notes);
          results.push(enrollment.toJSON());
        } catch (error) {
          errors.push({
            enrollmentId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      res.json({
        success: true,
        message: `Processed ${enrollmentIds.length} enrollments`,
        data: {
          rejected: results,
          errors: errors
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process bulk rejection'
      });
    }
  };
}
