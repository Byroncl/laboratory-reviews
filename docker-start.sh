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

# Check if .env exists, if not create from template
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    if [ -f docker-compose.env.template ]; then
        echo -e "${YELLOW}📋 Creating .env from template...${NC}"
        cp docker-compose.env.template .env
        echo -e "${GREEN}✓ .env created (you can edit it if needed)${NC}"
    else
        echo -e "${RED}❌ docker-compose.env.template not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env file found${NC}"
fi

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
    if docker exec laboratory_mongo mongosh -u admin -p admin123 --authenticationDatabase admin --eval "db.adminCommand('ping')" 2>/dev/null | grep -q "ok"; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Check MinIO
echo -n "Waiting for MinIO..."
for i in {1..30}; do
    if docker exec laboratory_minio curl -f http://localhost:9000/minio/health/live 2>/dev/null; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Check NestJS
echo -n "Waiting for NestJS Backend..."
for i in {1..30}; do
    if curl -f http://localhost:3025/api/health 2>/dev/null; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Check Angular Frontend
echo -n "Waiting for Angular Frontend..."
for i in {1..30}; do
    if curl -f http://localhost:3024/ 2>/dev/null | grep -q "html\|HTML"; then
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
echo -e "  🎨 Frontend:          ${GREEN}http://localhost:3024${NC}"
echo -e "  🔧 Backend API:       ${GREEN}http://localhost:3025${NC}"
echo -e "  📚 API Docs Swagger:  ${GREEN}http://localhost:3025/api${NC}"
echo -e "  💾 Mongo Express:     ${GREEN}http://localhost:8083${NC}"
echo -e "  🪣 MinIO Console:     ${GREEN}http://localhost:9001${NC}"
echo -e "  📖 Documentation:     ${GREEN}http://localhost:3026${NC}"

# Show MongoDB credentials
echo ""
echo -e "${YELLOW}🔐 Credentials:${NC}"
echo -e "  MongoDB:"
echo -e "    • URI: mongodb://admin:admin123@localhost:27019/laboratory-reviews"
echo -e "    • User: admin"
echo -e "    • Password: admin123"
echo -e "  Mongo Express:"
echo -e "    • User: admin"
echo -e "    • Password: admin"

# Show logs
echo ""
echo -e "${YELLOW}📋 Recent logs:${NC}"
docker-compose logs --tail=15

echo ""
echo -e "${GREEN}✅ All services are running!${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  docker-compose logs -f                    # View live logs"
echo "  docker-compose logs -f angular-app        # View only frontend logs"
echo "  docker-compose logs -f nestjs-app         # View only backend logs"
echo "  docker-compose logs -f mongodb            # View only MongoDB logs"
echo "  docker-compose ps                         # Check service status"
echo "  docker-compose down                       # Stop all services"
echo "  docker-compose down -v                    # Stop and remove volumes (data loss)"
echo ""
