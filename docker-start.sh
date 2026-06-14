#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🐳 Docker Deploy Script${NC}"
echo "========================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Please create .env file with required variables"
    exit 1
fi

echo -e "${GREEN}✓ .env file found${NC}"

# Build images
echo ""
echo -e "${YELLOW}📦 Building Docker images...${NC}"
docker-compose build --no-cache

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build successful${NC}"

# Stop existing containers
echo ""
echo -e "${YELLOW}⛔ Stopping existing containers...${NC}"
docker-compose down 2>/dev/null || true

echo -e "${GREEN}✓ Containers stopped${NC}"

# Start services
echo ""
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start services${NC}"
    docker-compose logs
    exit 1
fi

echo -e "${GREEN}✓ Services started${NC}"

# Wait for services to be ready
echo ""
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"

# Check MongoDB
echo -n "Waiting for MongoDB..."
for i in {1..30}; do
    if docker exec mi_mongo mongosh -u $MONGO_ROOT_USER -p $MONGO_ROOT_PASSWORD --authenticationDatabase admin --eval "db.adminCommand('ping')" 2>/dev/null | grep -q "ok"; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Check MinIO
echo -n "Waiting for MinIO..."
for i in {1..30}; do
    if docker exec mi_minio curl -f http://localhost:9000/minio/health/live 2>/dev/null; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Check NestJS
echo -n "Waiting for NestJS..."
for i in {1..30}; do
    if curl -f http://localhost:3000/health 2>/dev/null; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Show status
echo ""
echo -e "${YELLOW}📊 Service Status:${NC}"
docker-compose ps

# Show access points
echo ""
echo -e "${YELLOW}🌐 Access Points:${NC}"
echo -e "  Backend API:        ${GREEN}http://localhost:3000${NC}"
echo -e "  API Docs:           ${GREEN}http://localhost:3000/api${NC}"
echo -e "  MinIO Console:      ${GREEN}http://localhost:9001${NC}"
echo -e "  Documentation:      ${GREEN}http://localhost:3001${NC}"

# Show logs
echo ""
echo -e "${YELLOW}📋 Recent logs:${NC}"
docker-compose logs --tail=10

echo ""
echo -e "${GREEN}✅ Docker deployment complete!${NC}"
echo ""
echo "Useful commands:"
echo "  docker-compose logs -f                  # View live logs"
echo "  docker-compose logs -f nestjs-app       # View only backend logs"
echo "  docker-compose ps                       # Check service status"
echo "  docker-compose down                     # Stop all services"
echo "  docker-compose down -v                  # Stop and remove volumes"
