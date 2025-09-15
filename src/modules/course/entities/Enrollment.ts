import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { IsNotEmpty, IsEnum } from 'class-validator';
import { User } from '../../auth/entities/User';
import { Course } from './Course';

export enum EnrollmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DROPPED = 'dropped'
}

@Entity('enrollments')
@Unique(['studentId', 'courseId'])
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  @IsNotEmpty()
  studentId: number;

  @Column({ type: 'int' })
  @IsNotEmpty()
  courseId: number;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.PENDING,
  })
  @IsEnum(EnrollmentStatus)
  status: EnrollmentStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'int', nullable: true })
  approvedBy?: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @ManyToOne(() => Course, { eager: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'approvedBy' })
  approver?: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toJSON() {
    const { student, course, approver, ...enrollmentWithoutRelations } = this;
    return {
      ...enrollmentWithoutRelations,
      student: student ? student.toJSON() : null,
      course: course ? course.toJSON() : null,
      approver: approver ? approver.toJSON() : null
    };
  }
}
