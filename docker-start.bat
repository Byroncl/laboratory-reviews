@echo off
setlocal enabledelayedexpansion

echo.
echo === Docker Deploy Script ===
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

REM Check if .env exists
if not exist .env (
    echo [ERROR] .env file not found
    echo Please create .env file with required variables
    pause
    exit /b 1
)

echo [OK] .env file found
echo.

REM Build images
echo Building Docker images...
docker-compose build --no-cache

if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)

echo [OK] Build successful
echo.

REM Stop existing containers
echo Stopping existing containers...
docker-compose down 2>nul

echo [OK] Containers stopped
echo.

REM Start services
echo Starting services...
docker-compose up -d

if errorlevel 1 (
    echo [ERROR] Failed to start services
    docker-compose logs
    pause
    exit /b 1
)

echo [OK] Services started
echo.

REM Wait for services
echo Waiting for services to be healthy...

REM Check MongoDB
echo Waiting for MongoDB...
timeout /t 5 /nobreak

REM Check MinIO
echo Waiting for MinIO...
timeout /t 5 /nobreak

REM Check NestJS
echo Waiting for NestJS...
timeout /t 5 /nobreak

echo.
echo === Service Status ===
docker-compose ps

echo.
echo === Access Points ===
echo Backend API:      http://localhost:3000
echo API Docs:         http://localhost:3000/api
echo MinIO Console:    http://localhost:9001
echo Documentation:    http://localhost:3001

echo.
echo === Recent Logs ===
docker-compose logs --tail=10

echo.
echo [OK] Docker deployment complete!
echo.
echo Useful commands:
echo   docker-compose logs -f                  # View live logs
echo   docker-compose logs -f nestjs-app       # View only backend logs
echo   docker-compose ps                       # Check service status
echo   docker-compose down                     # Stop all services
echo   docker-compose down -v                  # Stop and remove volumes
echo.

pause
