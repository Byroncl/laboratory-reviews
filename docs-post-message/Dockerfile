# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy the built Docusaurus app to nginx HTML directory
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx config and remove default config
COPY nginx.conf /etc/nginx/conf.d/app.conf
RUN rm -f /etc/nginx/conf.d/default.conf

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3001/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
