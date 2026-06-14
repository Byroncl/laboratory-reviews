# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --production --legacy-peer-deps

# Copy built assets from builder
COPY --from=builder /app/build ./build

EXPOSE 3000

# Use serve package or http-server for static files
CMD ["npm", "run", "serve"]
