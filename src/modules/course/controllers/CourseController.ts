import { Request, Response } from 'express';
import { CourseService, CreateCourseData, UpdateCourseData, CourseFilters } from '../services/CourseService';
import { AuthenticatedRequest } from '../../../shared/types';

export class CourseController {
  private courseService: CourseService;

  constructor() {
    this.courseService = new CourseService();
  }

  // Create a new course (Lecturers and Admins)
  createCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const { title, description, code, credits, maxStudents } = req.body;

      const courseData: CreateCourseData = {
        title,
        description,
        code,
        credits,
        maxStudents: maxStudents || 0,
        lecturerId: req.user.id
      };

      const course = await this.courseService.createCourse(courseData);

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: { course: course.toJSON() }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create course'
      });
    }
  };

  // Update a course (Lecturers and Admins)
  updateCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const courseId = parseInt(req.params.id);
      const updateData: UpdateCourseData = req.body;

      const course = await this.courseService.updateCourse(courseId, updateData, req.user.id);

      res.json({
        success: true,
        message: 'Course updated successfully',
        data: { course: course.toJSON() }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update course'
      });
    }
  };

  // Get a specific course by ID
  getCourseById = async (req: Request, res: Response): Promise<void> => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await this.courseService.getCourseById(courseId);

      if (!course) {
        res.status(404).json({
          success: false,
          error: 'Course not found'
        });
        return;
      }

      res.json({
        success: true,
        data: { course: course.toJSON() }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch course'
      });
    }
  };

  // Get all courses with filters (Public for published courses, restricted for others)
  getCourses = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: CourseFilters = {
        status: req.query.status as any,
        lecturerId: req.query.lecturerId ? parseInt(req.query.lecturerId as string) : undefined,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      };

      const result = await this.courseService.getCourses(filters);

      res.json({
        success: true,
        data: {
          courses: result.courses.map(course => course.toJSON()),
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
        error: error instanceof Error ? error.message : 'Failed to fetch courses'
      });
    }
  };

  // Get published courses (Public endpoint for students)
  getPublishedCourses = async (req: Request, res: Response): Promise<void> => {
    try {
      const courses = await this.courseService.getPublishedCourses();

      res.json({
        success: true,
        data: {
          courses: courses.map(course => course.toJSON())
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch published courses'
      });
    }
  };

  // Get courses by lecturer (Lecturers and Admins)
  getCoursesByLecturer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const lecturerId = req.user.role === 'admin' && req.params.lecturerId 
        ? parseInt(req.params.lecturerId) 
        : req.user.id;

      const courses = await this.courseService.getCoursesByLecturer(lecturerId);

      res.json({
        success: true,
        data: {
          courses: courses.map(course => course.toJSON())
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch lecturer courses'
      });
    }
  };

  // Delete a course (Lecturers and Admins)
  deleteCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const courseId = parseInt(req.params.id);
      await this.courseService.deleteCourse(courseId, req.user.id);

      res.json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete course'
      });
    }
  };

  // Update course status (Lecturers and Admins)
  updateCourseStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const courseId = parseInt(req.params.id);
      const { status } = req.body;

      if (!status || !['draft', 'published', 'archived'].includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status. Must be draft, published, or archived'
        });
        return;
      }

      const course = await this.courseService.updateCourseStatus(courseId, status, req.user.id);

      res.json({
        success: true,
        message: 'Course status updated successfully',
        data: { course: course.toJSON() }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update course status'
      });
    }
  };

  // Upload syllabus file (Lecturers and Admins)
  uploadSyllabus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const courseId = parseInt(req.params.id);
      
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
        return;
      }

      const syllabusUrl = `/uploads/syllabi/${req.file.filename}`;
      const syllabusFileName = req.file.originalname;

      const course = await this.courseService.updateCourse(courseId, {
        syllabusUrl,
        syllabusFileName
      }, req.user.id);

      res.json({
        success: true,
        message: 'Syllabus uploaded successfully',
        data: { 
          course: course.toJSON(),
          file: {
            url: syllabusUrl,
            filename: syllabusFileName,
            size: req.file.size
          }
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload syllabus'
      });
    }
  };
}
