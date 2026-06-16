# Stage 1: Build Angular application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application with docker configuration
RUN npm run build -- --configuration docker

# Stage 2: Serve with nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/

# Copy built application from builder stage
COPY --from=builder /app/dist/frontend-post-message-angular/browser /usr/share/nginx/html

# Expose port
EXPOSE 4200

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
