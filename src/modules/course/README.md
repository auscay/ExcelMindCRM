# Course Management Module

This module provides comprehensive course management functionality for the ExcelMind CRM system, including course creation, enrollment management, and file upload capabilities.

## Features

### For Lecturers
- Create and update courses
- Upload syllabus files (PDF, DOC, DOCX)
- Manage course status (draft, published, archived)
- View their own courses
- Approve/reject student enrollments
- Bulk approve/reject enrollments

### For Students
- Browse published courses
- Enroll in courses
- View their enrollments
- Drop courses

### For Admins
- Full course management capabilities
- View all courses and enrollments
- Assign lecturers to courses
- Manage any user's enrollments

## API Endpoints

### Course Management

#### Public Endpoints
- `GET /api/courses/published` - Get all published courses
- `GET /api/courses/:id` - Get course by ID

#### Authenticated Endpoints
- `GET /api/courses` - Get courses with filters (all authenticated users)
- `POST /api/courses` - Create course (lecturers/admins)
- `PUT /api/courses/:id` - Update course (lecturers/admins)
- `PATCH /api/courses/:id/status` - Update course status (lecturers/admins)
- `POST /api/courses/:id/syllabus` - Upload syllabus file (lecturers/admins)
- `DELETE /api/courses/:id` - Delete course (lecturers/admins)
- `GET /api/courses/lecturer/my-courses` - Get lecturer's courses
- `GET /api/courses/lecturer/:lecturerId` - Get courses by lecturer (admins)

### Enrollment Management

#### Student Endpoints
- `POST /api/enrollments/enroll` - Enroll in a course
- `GET /api/enrollments/my-enrollments` - Get student's enrollments
- `PATCH /api/enrollments/:id/drop` - Drop enrollment

#### Lecturer/Admin Endpoints
- `GET /api/enrollments` - Get enrollments with filters
- `GET /api/enrollments/pending` - Get pending enrollments
- `GET /api/enrollments/course/:courseId` - Get course enrollments
- `PATCH /api/enrollments/:id/approve` - Approve enrollment
- `PATCH /api/enrollments/:id/reject` - Reject enrollment
- `PATCH /api/enrollments/bulk-approve` - Bulk approve enrollments
- `PATCH /api/enrollments/bulk-reject` - Bulk reject enrollments

#### General Endpoints
- `GET /api/enrollments/:id` - Get enrollment by ID
- `PATCH /api/enrollments/:id` - Update enrollment

## Data Models

### Course Entity
```typescript
{
  id: number;
  title: string;
  description: string;
  code: string;
  credits: number;
  maxStudents: number;
  status: 'draft' | 'published' | 'archived';
  syllabusUrl?: string;
  syllabusFileName?: string;
  lecturerId: number;
  lecturer: User;
  enrollments: Enrollment[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Enrollment Entity
```typescript
{
  id: number;
  studentId: number;
  courseId: number;
  status: 'pending' | 'approved' | 'rejected' | 'dropped';
  notes?: string;
  approvedBy?: number;
  student: User;
  course: Course;
  approver?: User;
  createdAt: Date;
  updatedAt: Date;
}
```

## File Upload

The module supports uploading syllabus files with the following specifications:
- **Allowed formats**: PDF, DOC, DOCX
- **Maximum file size**: 10MB
- **Storage location**: `uploads/syllabi/`
- **File naming**: `syllabus-{timestamp}-{random}.{extension}`

## Validation

All endpoints include comprehensive validation:
- Course data validation (title, description, code, credits)
- Enrollment data validation
- File upload validation
- Role-based access control

## Error Handling

The module includes robust error handling for:
- Validation errors
- File upload errors
- Permission errors
- Database errors
- Business logic errors

## Usage Examples

### Create a Course (Lecturer)
```bash
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Introduction to Programming",
  "description": "Learn the fundamentals of programming",
  "code": "CS101",
  "credits": 3,
  "maxStudents": 30
}
```

### Enroll in a Course (Student)
```bash
POST /api/enrollments/enroll
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": 1,
  "notes": "Interested in learning programming"
}
```

### Upload Syllabus (Lecturer)
```bash
POST /api/courses/1/syllabus
Authorization: Bearer <token>
Content-Type: multipart/form-data

syllabus: <file>
```

### Approve Enrollment (Lecturer/Admin)
```bash
PATCH /api/enrollments/1/approve
Authorization: Bearer <token>
```

## Security

- All endpoints require authentication
- Role-based access control (RBAC)
- File upload security (type and size validation)
- Input validation and sanitization
- SQL injection protection through TypeORM

## Dependencies

- `multer` - File upload handling
- `express-validator` - Input validation
- `class-validator` - Entity validation
- `typeorm` - Database ORM
