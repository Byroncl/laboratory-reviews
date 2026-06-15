#!/bin/bash
set -e

# Copy Docusaurus files from /docs to root if they exist
if [ -d /usr/share/nginx/html/docs ]; then
  cp -r /usr/share/nginx/html/docs/* /usr/share/nginx/html/ 2>/dev/null || true
  rm -rf /usr/share/nginx/html/docs
fi

# Remove any default nginx config that might be restored
rm -f /etc/nginx/conf.d/default.conf

# Create our custom config
cat > /etc/nginx/conf.d/app.conf << 'NGINX_CONFIG'
server {
    listen 3001 default_server;
    server_name _;

    root /usr/share/nginx/html;
    index index.html index.htm;

    gzip on;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;
    gzip_vary on;
    gzip_min_length 1000;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~ /\. {
        deny all;
        return 404;
    }

    location ~ \.(bak|config|sql|fla|psd|ini|log|sh|inc|swp|dist)$ {
        deny all;
        return 404;
    }

    error_log /var/log/nginx/error.log warn;
    access_log /var/log/nginx/access.log combined;
}
NGINX_CONFIG

# Start nginx
exec "$@"
