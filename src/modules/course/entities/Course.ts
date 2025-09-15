import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { User } from '../../auth/entities/User';
import { Enrollment } from './Enrollment';

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Column({ type: 'text' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  code: string;

  @Column({ type: 'int' })
  @IsNumber()
  @Min(1)
  @Max(6)
  credits: number;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  @Min(0)
  maxStudents: number;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status: CourseStatus;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  syllabusUrl?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  syllabusFileName?: string;

  @Column({ type: 'int' })
  lecturerId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'lecturerId' })
  lecturer: User;

  @OneToMany(() => Enrollment, enrollment => enrollment.course)
  enrollments: Enrollment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toJSON() {
    const { lecturer, ...courseWithoutLecturer } = this;
    return {
      ...courseWithoutLecturer,
      lecturer: lecturer ? lecturer.toJSON() : null
    };
  }
}
