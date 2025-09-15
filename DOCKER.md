# Docker Setup for ExcelMind CRM

This guide explains how to run the ExcelMind CRM application using Docker with PostgreSQL.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (usually included with Docker Desktop)

## Quick Start

1. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Run in detached mode (background):**
   ```bash
   docker-compose up -d --build
   ```

3. **Stop all services:**
   ```bash
   docker-compose down
   ```

4. **Stop and remove volumes (clears database data):**
   ```bash
   docker-compose down -v
   ```

## Services

### PostgreSQL Database
- **Container name:** `excelmind-postgres`
- **Port:** `5432`
- **Database:** `excelmind_crm`
- **Username:** `postgres`
- **Password:** `postgres123`
- **Data persistence:** PostgreSQL data is stored in a Docker volume

### Node.js Application
- **Container name:** `excelmind-app`
- **Port:** `3000`
- **Environment:** Production
- **Dependencies:** Waits for PostgreSQL to be ready before starting

### pgAdmin (PostgreSQL Web Interface)
- **Container name:** `excelmind-pgadmin`
- **Port:** `5050`
- **Web Interface:** `http://localhost:5050`
- **Email:** `admin@excelmind.com`
- **Password:** `admin123`
- **Purpose:** Web-based PostgreSQL administration and database management

## Environment Variables

The application uses the following environment variables (set in docker-compose.yml):

```yaml
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=excelmind_crm
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres123
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
NODE_ENV=production
```

## API Endpoints

Once running, the API will be available at:
- **Base URL:** `http://localhost:3000`
- **Health Check:** `GET http://localhost:3000/api/health`
- **Auth Routes:**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/profile` (requires authentication)
  - `GET /api/auth/verify` (requires authentication)

## Database Access

### Web Interface (Recommended)
Access pgAdmin web interface at: **http://localhost:5050**

**Login Credentials:**
- Email: `admin@excelmind.com`
- Password: `admin123`

**After logging in:**
1. Right-click "Servers" in the left panel
2. Select "Register" → "Server"
3. **General Tab:**
   - Name: `ExcelMind PostgreSQL`
4. **Connection Tab:**
   - Host name/address: `postgres`
   - Port: `5432`
   - Username: `postgres`
   - Password: `postgres123`
5. Click "Save"

### Command Line Access
```bash
# Using psql (if installed locally)
psql -h localhost -p 5432 -U postgres -d excelmind_crm

# Or using Docker
docker exec -it excelmind-postgres psql -U postgres -d excelmind_crm
```

## Development

For development with hot reload, you can run:

```bash
# Start only PostgreSQL
docker-compose up postgres

# Run the app locally with npm
npm run dev
```

## Troubleshooting

1. **Port conflicts:** Make sure ports 3000 and 5432 are not in use by other services
2. **Database connection issues:** Ensure PostgreSQL container is fully started before the app container
3. **Build issues:** Try rebuilding without cache: `docker-compose build --no-cache`
4. **Permission issues:** Make sure Docker has permission to access your project directory

## Production Considerations

- Change the JWT_SECRET to a strong, unique secret
- Use environment files or Docker secrets for sensitive data
- Consider using a reverse proxy (nginx) for production
- Set up proper logging and monitoring
- Use Docker health checks for better reliability
