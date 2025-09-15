import { Repository } from 'typeorm';
import { AppDataSource } from '../../../shared/config/database';
import { Course, CourseStatus } from '../entities/Course';
import { User } from '../../auth/entities/User';
import { validate } from 'class-validator';

export interface CreateCourseData {
  title: string;
  description: string;
  code: string;
  credits: number;
  maxStudents: number;
  lecturerId: number;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  code?: string;
  credits?: number;
  maxStudents?: number;
  status?: CourseStatus;
  syllabusUrl?: string;
  syllabusFileName?: string;
}

export interface CourseFilters {
  status?: CourseStatus;
  lecturerId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export class CourseService {
  private courseRepository: Repository<Course>;
  private userRepository: Repository<User>;

  constructor() {
    this.courseRepository = AppDataSource.getRepository(Course);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createCourse(data: CreateCourseData): Promise<Course> {
    try {
      // Verify lecturer exists and is a lecturer or admin
      const lecturer = await this.userRepository.findOne({
        where: { id: data.lecturerId }
      });

      if (!lecturer) {
        throw new Error('Lecturer not found');
      }

      if (lecturer.role !== 'lecturer' && lecturer.role !== 'admin') {
        throw new Error('User must be a lecturer or admin to create courses');
      }

      // Check if course code already exists
      const existingCourse = await this.courseRepository.findOne({
        where: { code: data.code }
      });

      if (existingCourse) {
        throw new Error('Course with this code already exists');
      }

      // Create new course
      const course = this.courseRepository.create(data);
      
      // Validate course data
      const errors = await validate(course);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.map(e => Object.values(e.constraints || {})).join(', ')}`);
      }

      // Save course to database
      return await this.courseRepository.save(course);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create course due to an unexpected error');
    }
  }

  async updateCourse(id: number, data: UpdateCourseData, userId: number): Promise<Course> {
    try {
      const course = await this.courseRepository.findOne({
        where: { id },
        relations: ['lecturer']
      });

      if (!course) {
        throw new Error('Course not found');
      }

      // Check if user has permission to update this course
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      if (user.role !== 'admin' && course.lecturerId !== userId) {
        throw new Error('You can only update courses you created');
      }

      // Update course data
      Object.assign(course, data);
      
      // Validate updated course data
      const errors = await validate(course);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.map(e => Object.values(e.constraints || {})).join(', ')}`);
      }

      return await this.courseRepository.save(course);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update course due to an unexpected error');
    }
  }

  async getCourseById(id: number): Promise<Course | null> {
    return await this.courseRepository.findOne({
      where: { id },
      relations: ['lecturer', 'enrollments', 'enrollments.student']
    });
  }

  async getCourses(filters: CourseFilters = {}): Promise<{ courses: Course[]; total: number }> {
    try {
      const queryBuilder = this.courseRepository
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.lecturer', 'lecturer')
        .leftJoinAndSelect('course.enrollments', 'enrollments')
        .leftJoinAndSelect('enrollments.student', 'student');

      // Apply filters
      if (filters.status) {
        queryBuilder.andWhere('course.status = :status', { status: filters.status });
      }

      if (filters.lecturerId) {
        queryBuilder.andWhere('course.lecturerId = :lecturerId', { lecturerId: filters.lecturerId });
      }

      if (filters.search) {
        queryBuilder.andWhere(
          '(course.title ILIKE :search OR course.description ILIKE :search OR course.code ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }

      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;

      queryBuilder.skip(offset).take(limit);
      queryBuilder.orderBy('course.createdAt', 'DESC');

      const [courses, total] = await queryBuilder.getManyAndCount();

      return { courses, total };
    } catch (error) {
      throw new Error('Failed to fetch courses');
    }
  }

  async getCoursesByLecturer(lecturerId: number): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { lecturerId },
      relations: ['lecturer', 'enrollments', 'enrollments.student'],
      order: { createdAt: 'DESC' }
    });
  }

  async getPublishedCourses(): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { status: CourseStatus.PUBLISHED },
      relations: ['lecturer'],
      order: { createdAt: 'DESC' }
    });
  }

  async deleteCourse(id: number, userId: number): Promise<void> {
    try {
      const course = await this.courseRepository.findOne({
        where: { id },
        relations: ['lecturer']
      });

      if (!course) {
        throw new Error('Course not found');
      }

      // Check if user has permission to delete this course
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      if (user.role !== 'admin' && course.lecturerId !== userId) {
        throw new Error('You can only delete courses you created');
      }

      await this.courseRepository.remove(course);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to delete course due to an unexpected error');
    }
  }

  async updateCourseStatus(id: number, status: CourseStatus, userId: number): Promise<Course> {
    try {
      const course = await this.courseRepository.findOne({
        where: { id },
        relations: ['lecturer']
      });

      if (!course) {
        throw new Error('Course not found');
      }

      // Check if user has permission to update status
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      if (user.role !== 'admin' && course.lecturerId !== userId) {
        throw new Error('You can only update status of courses you created');
      }

      course.status = status;
      return await this.courseRepository.save(course);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update course status due to an unexpected error');
    }
  }
}
