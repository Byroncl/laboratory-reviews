FROM node:20-alpine

WORKDIR /app

# Instalar http-server globalmente
RUN npm install -g http-server

COPY . .

EXPOSE 3000

CMD ["http-server", "-p", "3000", "-c-1"]
