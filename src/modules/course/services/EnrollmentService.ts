import { Repository } from 'typeorm';
import { AppDataSource } from '../../../shared/config/database';
import { Enrollment, EnrollmentStatus } from '../entities/Enrollment';
import { Course } from '../entities/Course';
import { Assignment } from '../entities/Assignment';
import { Submission } from '../entities/Submission';
import { User } from '../../auth/entities/User';
import { validate } from 'class-validator';

export interface CreateEnrollmentData {
  studentId: number;
  courseId: number;
  notes?: string;
}

export interface UpdateEnrollmentData {
  status?: EnrollmentStatus;
  notes?: string;
  approvedBy?: number;
}

export interface EnrollmentFilters {
  status?: EnrollmentStatus;
  studentId?: number;
  courseId?: number;
  page?: number;
  limit?: number;
}

export class EnrollmentService {
  private enrollmentRepository: Repository<Enrollment>;
  private courseRepository: Repository<Course>;
  private userRepository: Repository<User>;
  private assignmentRepository: Repository<Assignment>;
  private submissionRepository: Repository<Submission>;

  constructor() {
    this.enrollmentRepository = AppDataSource.getRepository(Enrollment);
    this.courseRepository = AppDataSource.getRepository(Course);
    this.userRepository = AppDataSource.getRepository(User);
    this.assignmentRepository = AppDataSource.getRepository(Assignment);
    this.submissionRepository = AppDataSource.getRepository(Submission);
  }

  async createEnrollment(data: CreateEnrollmentData): Promise<Enrollment> {
    try {
      // Verify student exists
      const student = await this.userRepository.findOne({
        where: { id: data.studentId }
      });

      if (!student) {
        throw new Error('Student not found');
      }

      if (student.role !== 'student') {
        throw new Error('User must be a student to enroll in courses');
      }

      // Verify course exists and is published
      const course = await this.courseRepository.findOne({
        where: { id: data.courseId }
      });

      if (!course) {
        throw new Error('Course not found');
      }

      if (course.status !== 'published') {
        throw new Error('Course is not available for enrollment');
      }

      // Check if student is already enrolled
      const existingEnrollment = await this.enrollmentRepository.findOne({
        where: { studentId: data.studentId, courseId: data.courseId }
      });

      if (existingEnrollment) {
        if (existingEnrollment.status === 'dropped') {
          // Allow re-enrollment if previously dropped
          existingEnrollment.status = EnrollmentStatus.PENDING;
          existingEnrollment.notes = data.notes;
          return await this.enrollmentRepository.save(existingEnrollment);
        } else {
          throw new Error('Student is already enrolled in this course');
        }
      }

      // Check if course has reached maximum capacity
      const enrollmentCount = await this.enrollmentRepository.count({
        where: { 
          courseId: data.courseId, 
          status: EnrollmentStatus.APPROVED 
        }
      });

      if (course.maxStudents > 0 && enrollmentCount >= course.maxStudents) {
        throw new Error('Course has reached maximum capacity');
      }

      // Create new enrollment with default pending status
      const enrollment = this.enrollmentRepository.create({
        ...data,
        status: EnrollmentStatus.PENDING
      });
      
      // Validate enrollment data
      const errors = await validate(enrollment);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.map(e => Object.values(e.constraints || {})).join(', ')}`);
      }

      // Save enrollment to database
      return await this.enrollmentRepository.save(enrollment);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create enrollment due to an unexpected error');
    }
  }

  async computeFinalGradeForEnrollment(enrollmentId: number): Promise<{ finalGrade: number; breakdown: Array<{ assignmentId: number; weight: number; grade: number | null }>; totalWeight: number }>{
    const enrollment = await this.enrollmentRepository.findOne({ where: { id: enrollmentId } });
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }
    if (enrollment.status !== EnrollmentStatus.APPROVED) {
      throw new Error('Enrollment is not approved');
    }
    const assignments = await this.assignmentRepository.find({ where: { courseId: enrollment.courseId, isActive: true } });
    if (assignments.length === 0) {
      return { finalGrade: 0, breakdown: [], totalWeight: 0 };
    }
    const submissions = await this.submissionRepository.find({ where: { studentId: enrollment.studentId } });
    let weightedSum = 0;
    let totalWeight = 0;
    const breakdown: Array<{ assignmentId: number; weight: number; grade: number | null }> = [];
    for (const a of assignments) {
      totalWeight += a.weight;
      const submission = submissions.find(s => s.assignmentId === a.id);
      const grade = submission?.grade ?? null;
      if (typeof grade === 'number') {
        weightedSum += grade * (a.weight / 100);
      }
      breakdown.push({ assignmentId: a.id, weight: a.weight, grade });
    }
    // If totalWeight != 100, still use weights as configured, do not normalize beyond 100.
    const finalGrade = Math.round(weightedSum * 100) / 100;
    return { finalGrade, breakdown, totalWeight };
  }

  async updateEnrollment(id: number, data: UpdateEnrollmentData, userId: number): Promise<Enrollment> {
    try {
      const enrollment = await this.enrollmentRepository.findOne({
        where: { id },
        relations: ['course', 'student', 'approver']
      });

      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      // Check if user has permission to update this enrollment
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      // Students can only update their own enrollments (to drop)
      if (user.role === 'student' && enrollment.studentId !== userId) {
        throw new Error('You can only update your own enrollments');
      }

      // Lecturers and admins can approve/reject enrollments for their courses
      if ((user.role === 'lecturer' || user.role === 'admin') && 
          enrollment.course.lecturerId !== userId && user.role !== 'admin') {
        throw new Error('You can only update enrollments for your own courses');
      }

      // Update enrollment data
      Object.assign(enrollment, data);
      
      // If status is being changed to approved/rejected, set the approver
      if (data.status && (data.status === EnrollmentStatus.APPROVED || data.status === EnrollmentStatus.REJECTED)) {
        enrollment.approvedBy = userId;
      }
      
      // Validate updated enrollment data
      const errors = await validate(enrollment);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.map(e => Object.values(e.constraints || {})).join(', ')}`);
      }

      return await this.enrollmentRepository.save(enrollment);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update enrollment due to an unexpected error');
    }
  }

  async getEnrollmentById(id: number): Promise<Enrollment | null> {
    return await this.enrollmentRepository.findOne({
      where: { id },
      relations: ['student', 'course', 'course.lecturer', 'approver']
    });
  }

  async getEnrollments(filters: EnrollmentFilters = {}): Promise<{ enrollments: Enrollment[]; total: number }> {
    try {
      const queryBuilder = this.enrollmentRepository
        .createQueryBuilder('enrollment')
        .leftJoinAndSelect('enrollment.student', 'student')
        .leftJoinAndSelect('enrollment.course', 'course')
        .leftJoinAndSelect('course.lecturer', 'lecturer')
        .leftJoinAndSelect('enrollment.approver', 'approver');

      // Apply filters
      if (filters.status) {
        queryBuilder.andWhere('enrollment.status = :status', { status: filters.status });
      }

      if (filters.studentId) {
        queryBuilder.andWhere('enrollment.studentId = :studentId', { studentId: filters.studentId });
      }

      if (filters.courseId) {
        queryBuilder.andWhere('enrollment.courseId = :courseId', { courseId: filters.courseId });
      }

      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;

      queryBuilder.skip(offset).take(limit);
      queryBuilder.orderBy('enrollment.createdAt', 'DESC');

      const [enrollments, total] = await queryBuilder.getManyAndCount();

      return { enrollments, total };
    } catch (error) {
      throw new Error('Failed to fetch enrollments');
    }
  }

  async getEnrollmentsByStudent(studentId: number): Promise<Enrollment[]> {
    return await this.enrollmentRepository.find({
      where: { studentId },
      relations: ['course', 'course.lecturer', 'approver'],
      order: { createdAt: 'DESC' }
    });
  }

  async getEnrollmentsByCourse(courseId: number): Promise<Enrollment[]> {
    return await this.enrollmentRepository.find({
      where: { courseId },
      relations: ['student', 'approver'],
      order: { createdAt: 'DESC' }
    });
  }

  async getPendingEnrollments(): Promise<Enrollment[]> {
    return await this.enrollmentRepository.find({
      where: { status: EnrollmentStatus.PENDING },
      relations: ['student', 'course', 'course.lecturer'],
      order: { createdAt: 'ASC' }
    });
  }

  async dropEnrollment(id: number, userId: number): Promise<Enrollment> {
    try {
      const enrollment = await this.enrollmentRepository.findOne({
        where: { id },
        relations: ['student', 'course']
      });

      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      // Check if user has permission to drop this enrollment
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      // Students can only drop their own enrollments
      if (user.role === 'student' && enrollment.studentId !== userId) {
        throw new Error('You can only drop your own enrollments');
      }

      // Admins and lecturers can drop any enrollment
      if (user.role !== 'admin' && user.role !== 'lecturer' && enrollment.studentId !== userId) {
        throw new Error('Insufficient permissions to drop this enrollment');
      }

      enrollment.status = EnrollmentStatus.DROPPED;
      return await this.enrollmentRepository.save(enrollment);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to drop enrollment due to an unexpected error');
    }
  }

  async approveEnrollment(id: number, userId: number): Promise<Enrollment> {
    return this.updateEnrollment(id, { 
      status: EnrollmentStatus.APPROVED, 
      approvedBy: userId 
    }, userId);
  }

  async rejectEnrollment(id: number, userId: number, notes?: string): Promise<Enrollment> {
    return this.updateEnrollment(id, { 
      status: EnrollmentStatus.REJECTED, 
      approvedBy: userId,
      notes 
    }, userId);
  }
}
