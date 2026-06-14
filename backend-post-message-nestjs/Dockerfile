# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci && \
    npm cache clean --force

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

USER nestjs

# Expose port
EXPOSE 3000


# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/main.js"]
