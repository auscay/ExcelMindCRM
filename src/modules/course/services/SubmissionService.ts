import { Repository } from 'typeorm';
import { AppDataSource } from '../../../shared/config/database';
import { Submission } from '../entities/Submission';
import { Assignment } from '../entities/Assignment';
import { User } from '../../auth/entities/User';
import { validate } from 'class-validator';

export interface CreateSubmissionData {
  assignmentId: number;
  studentId: number;
  contentText?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface UpdateSubmissionData {
  contentText?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
}

export interface GradeSubmissionData {
  grade: number; // 0-100
  feedback?: string;
  gradedBy: number;
}

export class SubmissionService {
  private submissionRepository: Repository<Submission>;
  private assignmentRepository: Repository<Assignment>;
  private userRepository: Repository<User>;

  constructor() {
    this.submissionRepository = AppDataSource.getRepository(Submission);
    this.assignmentRepository = AppDataSource.getRepository(Assignment);
    this.userRepository = AppDataSource.getRepository(User);
  }

  private async assertAssignmentExists(assignmentId: number): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOne({ where: { id: assignmentId } });
    if (!assignment) throw new Error('Assignment not found');
    if (!assignment.isActive) throw new Error('Assignment is not active');
    return assignment;
  }

  async createSubmission(data: CreateSubmissionData): Promise<Submission> {
    await this.assertAssignmentExists(data.assignmentId);
    const student = await this.userRepository.findOne({ where: { id: data.studentId } });
    if (!student) throw new Error('Student not found');
    if (student.role !== 'student') throw new Error('Only students can submit assignments');

    if (!data.contentText && !data.fileUrl) {
      throw new Error('Either contentText or fileUrl is required');
    }

    const submission = this.submissionRepository.create({ ...data });
    const errors = await validate(submission);
    if (errors.length > 0) throw new Error('Validation failed creating submission');
    return this.submissionRepository.save(submission);
  }

  async updateSubmission(id: number, data: UpdateSubmissionData, userId: number): Promise<Submission> {
    const submission = await this.submissionRepository.findOne({ where: { id } });
    if (!submission) throw new Error('Submission not found');
    if (submission.studentId !== userId) throw new Error('You can only edit your own submission');
    Object.assign(submission, data);
    const errors = await validate(submission);
    if (errors.length > 0) throw new Error('Validation failed updating submission');
    return this.submissionRepository.save(submission);
  }

  async gradeSubmission(id: number, data: GradeSubmissionData, graderId: number): Promise<Submission> {
    const submission = await this.submissionRepository.findOne({ where: { id } });
    if (!submission) throw new Error('Submission not found');
    const assignment = await this.assertAssignmentExists(submission.assignmentId);

    const grader = await this.userRepository.findOne({ where: { id: graderId } });
    if (!grader) throw new Error('User not found');

    // Only course lecturer or admin can grade
    if (grader.role !== 'admin') {
      // Need to load the course lecturerId
      const courseId = assignment.courseId;
      const courseLecturerId = assignment.course.lecturerId;
      if (grader.role !== 'lecturer' || grader.id !== courseLecturerId) {
        throw new Error('Only the course lecturer or admin can grade');
      }
    }

    if (data.grade < 0 || data.grade > 100) throw new Error('Grade must be between 0 and 100');

    submission.grade = data.grade;
    submission.feedback = data.feedback;
    submission.gradedBy = graderId;
    const errors = await validate(submission);
    if (errors.length > 0) throw new Error('Validation failed grading submission');
    return this.submissionRepository.save(submission);
  }

  async getSubmissionsByAssignment(assignmentId: number): Promise<Submission[]> {
    return this.submissionRepository.find({ where: { assignmentId }, order: { createdAt: 'DESC' } });
  }

  async getMySubmissions(studentId: number): Promise<Submission[]> {
    return this.submissionRepository.find({ where: { studentId }, order: { createdAt: 'DESC' } });
  }
}


