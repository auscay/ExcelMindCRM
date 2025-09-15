import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Assignment } from './Assignment';
import { User } from '../../auth/entities/User';

@Entity('submissions')
@Unique(['assignmentId', 'studentId'])
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  @IsNotEmpty()
  assignmentId: number;

  @ManyToOne(() => Assignment, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assignmentId' })
  assignment: Assignment;

  @Column({ type: 'int' })
  @IsNotEmpty()
  studentId: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: User;

  // Either text content or uploaded file
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  contentText?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  fileName?: string;

  // Grading
  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  grade?: number;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  feedback?: string;

  @Column({ type: 'int', nullable: true })
  gradedBy?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


