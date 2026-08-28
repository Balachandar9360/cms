# Docker Setup for Canteen Management System

This guide explains how to run the Canteen Management System using Docker and Docker Compose.

## Prerequisites

- Docker installed ([Download Docker](https://www.docker.com/products/docker-desktop))
- Docker Compose installed (included with Docker Desktop)
- At least 2GB of free disk space

## Quick Start

### 1. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
- Database credentials
- Backend and frontend ports
- Email configuration (for mail functionality)
- JWT secrets

### 2. Build and Run with Docker Compose

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **MySQL Database**: localhost:3306

## Service Details

### MySQL Database
- Container: `canteen_db`
- Port: 3306
- Volume: `mysql_data` (persistent storage)
- Credentials: Configured in `.env`

### Backend (Spring Boot)
- Container: `canteen_backend`
- Port: 8080
- Image: Built from `Dockerfile` in `canteen-system-backend/`
- Health check: Enabled
- Auto-restart: Unless stopped

### Frontend (React + Vite)
- Container: `canteen_frontend`
- Port: 3000 (exposed) / 80 (internal)
- Image: Built from `Dockerfile` in `canteen-system-frontend/`
- Server: Nginx with SPA routing
- Health check: Enabled
- Auto-restart: Unless stopped

## Common Commands

### View running containers
```bash
docker-compose ps
```

### View logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql
```

### Stop services
```bash
docker-compose stop
```

### Restart services
```bash
docker-compose restart
```

### Remove containers and volumes
```bash
# Remove containers only
docker-compose down

# Remove containers and volumes
docker-compose down -v
```

### Build specific service
```bash
docker-compose build backend
docker-compose build frontend
```

### Re-run after code changes
```bash
# Rebuild and restart specific service
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

## Development Workflow

### Modify Backend Code
1. Make changes in `canteen-system-backend/src/`
2. Rebuild and restart:
   ```bash
   docker-compose up -d --build backend
   ```

### Modify Frontend Code
1. Make changes in `canteen-system-frontend/src/`
2. Rebuild and restart:
   ```bash
   docker-compose up -d --build frontend
   ```

## Troubleshooting

### Database connection failed
- Ensure MySQL is running: `docker-compose ps`
- Check environment variables in `.env`
- View MySQL logs: `docker-compose logs mysql`
- Verify database port is not in use: `netstat -tuln | grep 3306` (Linux/Mac)

### Frontend not loading
- Check frontend logs: `docker-compose logs frontend`
- Ensure backend is running: `docker-compose logs backend`
- Clear browser cache and refresh

### Port already in use
- Change port in `.env` (e.g., `BACKEND_PORT=8081`)
- Or stop the service using the port: `docker-compose down`

### Backend not starting
- Check Java version: `docker exec canteen_backend java -version`
- View detailed logs: `docker-compose logs -f backend`
- Ensure application.yml is correct

## Production Deployment

For production deployment:

1. Use strong passwords in `.env`
2. Set `JWT_SECRET` to a secure value
3. Configure proper email credentials
4. Use volumes or external database for data persistence
5. Enable HTTPS/SSL (use reverse proxy like Nginx)
6. Set appropriate resource limits in `docker-compose.yml`
7. Configure logging and monitoring

## Performance Tuning

### Increase memory allocation
Edit `docker-compose.yml` and add to services:
```yaml
deploy:
  resources:
    limits:
      memory: 512M
    reservations:
      memory: 256M
```

### Optimize database
Add to MySQL service in `docker-compose.yml`:
```yaml
command: --max_connections=1000 --innodb_buffer_pool_size=256M
```

## Network Architecture

All services communicate via `canteen-network` bridge network:
- `backend` and `frontend` access MySQL via hostname: `mysql`
- `frontend` accesses backend via `backend` service name (internal)
- External access via exposed ports

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)
