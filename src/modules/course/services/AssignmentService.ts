import { Repository } from 'typeorm';
import { AppDataSource } from '../../../shared/config/database';
import { Assignment } from '../entities/Assignment';
import { Course } from '../entities/Course';
import { validate } from 'class-validator';

export interface CreateAssignmentData {
  courseId: number;
  title: string;
  description?: string;
  weight: number;
  dueAt?: Date;
  isActive?: boolean;
}

export interface UpdateAssignmentData {
  title?: string;
  description?: string;
  weight?: number;
  dueAt?: Date | null;
  isActive?: boolean;
}

export class AssignmentService {
  private assignmentRepository: Repository<Assignment>;
  private courseRepository: Repository<Course>;

  constructor() {
    this.assignmentRepository = AppDataSource.getRepository(Assignment);
    this.courseRepository = AppDataSource.getRepository(Course);
  }

  private async assertCourseExists(courseId: number): Promise<Course> {
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new Error('Course not found');
    }
    return course;
  }

  private async assertWeightWithinCourse(courseId: number, weight: number, excludeAssignmentId?: number): Promise<void> {
    const qb = this.assignmentRepository.createQueryBuilder('a')
      .select('COALESCE(SUM(a.weight), 0)', 'sum')
      .where('a.courseId = :courseId', { courseId });
    if (excludeAssignmentId) {
      qb.andWhere('a.id <> :id', { id: excludeAssignmentId });
    }
    const result = await qb.getRawOne<{ sum: string }>();
    const currentSum = parseInt(result?.sum || '0', 10);
    if (currentSum + weight > 100) {
      throw new Error(`Total assignment weight would exceed 100% (current ${currentSum}%, adding ${weight}%)`);
    }
  }

  async createAssignment(data: CreateAssignmentData): Promise<Assignment> {
    await this.assertCourseExists(data.courseId);
    await this.assertWeightWithinCourse(data.courseId, data.weight);

    const assignment = this.assignmentRepository.create({
      ...data,
      isActive: data.isActive ?? true,
    });

    const errors = await validate(assignment);
    if (errors.length > 0) {
      throw new Error('Validation failed creating assignment');
    }
    return this.assignmentRepository.save(assignment);
  }

  async updateAssignment(id: number, data: UpdateAssignmentData): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOne({ where: { id } });
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    if (typeof data.weight === 'number') {
      await this.assertWeightWithinCourse(assignment.courseId, data.weight, id);
    }
    Object.assign(assignment, data);
    const errors = await validate(assignment);
    if (errors.length > 0) {
      throw new Error('Validation failed updating assignment');
    }
    return this.assignmentRepository.save(assignment);
  }

  async deleteAssignment(id: number): Promise<void> {
    await this.assignmentRepository.delete(id);
  }

  async getAssignmentsForCourse(courseId: number): Promise<Assignment[]> {
    return this.assignmentRepository.find({ where: { courseId }, order: { createdAt: 'DESC' } });
  }

  async getAssignmentById(id: number): Promise<Assignment | null> {
    return this.assignmentRepository.findOne({ where: { id } });
  }
}


