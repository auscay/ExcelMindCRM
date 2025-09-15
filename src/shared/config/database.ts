import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../../modules/auth/entities/User';
import { Course } from '../../modules/course/entities/Course';
import { Enrollment } from '../../modules/course/entities/Enrollment';
import { Assignment } from '../../modules/course/entities/Assignment';
import { Submission } from '../../modules/course/entities/Submission';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || process.env.DB_PORT || '5432'),
  username: process.env.DATABASE_USERNAME || process.env.DB_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || process.env.DB_NAME || 'excelmind_crm',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Course, Enrollment, Assignment, Submission],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  }
};
