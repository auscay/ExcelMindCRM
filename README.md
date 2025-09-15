# ExcelMind CRM API

A robust Express TypeScript API with PostgreSQL, TypeORM, and JWT authentication featuring role-based access control (RBAC).

## Features

- 🔐 JWT Authentication with role-based access control
- 👥 User roles: Student, Lecturer, Admin
- 🗄️ PostgreSQL database with TypeORM
- 🛡️ Security middleware (Helmet, CORS)
- 📝 Input validation with class-validator
- 🔒 Password hashing with bcrypt
- 🎯 Role-specific dashboards
- 🏗️ Modular architecture with separate feature modules
- 📦 Clean separation of concerns (controllers, services, entities)

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up your PostgreSQL database:
```sql
CREATE DATABASE excelmind_crm;
```

3. Create a `.env` file based on `env.example`:
```bash
cp env.example .env
```

4. Update the `.env` file with your database credentials and JWT secret.

## Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=excelmind_crm

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

#### Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <jwt_token>
```

### Dashboards

#### Student Dashboard
```http
GET /api/dashboard/student
Authorization: Bearer <jwt_token>
```

#### Lecturer Dashboard
```http
GET /api/dashboard/lecturer
Authorization: Bearer <jwt_token>
```

#### Admin Dashboard
```http
GET /api/dashboard/admin
Authorization: Bearer <jwt_token>
```

#### My Dashboard (Role-based)
```http
GET /api/dashboard/my-dashboard
Authorization: Bearer <jwt_token>
```

### Health Check
```http
GET /api/health
```

## User Roles

- **Student**: Can access student dashboard and features
- **Lecturer**: Can access lecturer dashboard and student features
- **Admin**: Can access admin dashboard and all features

## Authentication Flow

1. Register a new user with a specific role
2. Login to receive a JWT token
3. Include the token in the Authorization header for protected routes
4. Access role-specific dashboards based on user permissions

## Database Migrations

```bash
# Generate migration
npm run migration:generate -- src/migrations/InitialMigration

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## Project Structure

```
src/
├── shared/                 # Shared utilities and configurations
│   ├── config/
│   │   └── database.ts     # Database configuration
│   ├── middleware/
│   │   ├── errorHandler.ts # Global error handling
│   │   └── requestLogger.ts # Request logging
│   ├── types/
│   │   └── index.ts        # Shared type definitions
│   └── index.ts            # Shared module exports
├── modules/                # Feature modules
│   ├── auth/               # Authentication module
│   │   ├── controllers/
│   │   │   └── AuthController.ts
│   │   ├── entities/
│   │   │   └── User.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── routes/
│   │   │   └── authRoutes.ts
│   │   ├── services/
│   │   │   └── AuthService.ts
│   │   └── index.ts        # Auth module exports
│   └── dashboard/          # Dashboard module
│       ├── controllers/
│       │   └── DashboardController.ts
│       ├── routes/
│       │   └── dashboardRoutes.ts
│       └── index.ts        # Dashboard module exports
├── routes/
│   └── index.ts            # Main route configuration
└── server.ts               # Main server file
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation
- Security headers with Helmet
- CORS configuration
- Environment variable protection

## Modular Architecture

The project follows a modular architecture pattern:

### **Shared Module** (`src/shared/`)
- Common utilities, types, and configurations
- Database configuration
- Global middleware (error handling, logging)
- Shared type definitions

### **Auth Module** (`src/modules/auth/`)
- Complete authentication functionality
- User entity and management
- JWT token handling
- Role-based access control middleware
- Authentication routes and controllers

### **Dashboard Module** (`src/modules/dashboard/`)
- Role-specific dashboard functionality
- Dashboard controllers and routes
- Access control based on user roles

### **Benefits of Modular Structure:**
- **Separation of Concerns**: Each module handles its own domain
- **Scalability**: Easy to add new modules without affecting existing ones
- **Maintainability**: Clear boundaries and responsibilities
- **Reusability**: Modules can be easily reused or extracted
- **Testing**: Each module can be tested independently

## Development

The project uses TypeScript with strict type checking. Make sure to:

1. Install dependencies: `npm install`
2. Set up your environment variables
3. Run in development mode: `npm run dev`
4. The server will automatically restart on file changes

### Adding New Modules

To add a new module:

1. Create a new folder in `src/modules/`
2. Follow the structure: `controllers/`, `services/`, `routes/`, `entities/` (if needed)
3. Create an `index.ts` file to export the module's public API
4. Import and use the module in `src/routes/index.ts`

## License

MIT
