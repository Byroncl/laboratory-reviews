# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Serve stage
FROM node:22-alpine

WORKDIR /app

RUN npm install -g http-server

COPY --from=builder /app/build /app/dist

EXPOSE 3001

CMD ["http-server", "dist", "-p", "3001", "-c-1"]
