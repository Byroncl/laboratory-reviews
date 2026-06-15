# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# Production stage - serve with simple HTTP server
FROM node:22-alpine

WORKDIR /app

# Install serve to serve static files
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/build ./build

# Create index.html that redirects to /docs/
RUN cat > ./build/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=/docs/">
    <title>Redirecting...</title>
</head>
<body>
    <p>Redirecting to <a href="/docs/">documentation</a>...</p>
    <script>
        window.location.href = '/docs/';
    </script>
</body>
</html>
EOF

# Create index.html in /docs/ that redirects to the intro page
RUN cat > ./build/docs/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=/docs/backend/intro/">
    <title>Redirecting...</title>
</head>
<body>
    <p>Redirecting to <a href="/docs/backend/intro/">documentation</a>...</p>
    <script>
        window.location.href = '/docs/backend/intro/';
    </script>
</body>
</html>
EOF

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3001/ || exit 1

CMD ["serve", "build", "-l", "3001"]
