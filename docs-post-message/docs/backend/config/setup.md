---
sidebar_position: 2
title: Guía de Configuración
description: Primeros pasos con el backend
---

# Guía de Configuración 🚀

## Prerrequisitos

- Node.js 18+
- MongoDB 4.4+
- MinIO (opcional para almacenamiento local de archivos)
- npm o yarn

## Instalación

```bash
cd backend-post-message-nestjs

# Instalar dependencias
npm install

# Copiar archivo de entorno
cp .env.example .env
```

## Configuración

Editar `.env` con tu configuración:

```bash
HOST=localhost
PORT=3000
MONGODB_URI=mongodb://localhost:27017/post-message
MINIO_ENDPOINT=localhost:9000
```

## Ejecutar el Servidor

### Modo Desarrollo

```bash
npm run start:dev
```

Ejecuta con hot-reload en http://localhost:3000

### Modo Producción

```bash
npm run build
npm run start:prod
```

## Configuración con Docker

```bash
# Iniciar MongoDB y MinIO
docker-compose up -d

# Ejecutar el backend
npm run start:dev
```

## Configuración de Base de Datos

MongoDB creará las colecciones automáticamente al primer guardado.

Para sembrar datos iniciales (roles, permisos):

```bash
npm run seed
```

## Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Modo watch
npm run test:watch

# Cobertura
npm run test:cov
```

## Solución de Problemas

### Error de Conexión a MongoDB
- Verificar `MONGODB_URI` en `.env`
- Asegurarse de que MongoDB está en ejecución
- Verificar autenticación si es necesario

### Error de Conexión a MinIO
- Verificar el formato de `MINIO_ENDPOINT`
- Asegurarse de que el contenedor MinIO está en ejecución
- Verificar credenciales

### Puerto Ya en Uso
```bash
# Cambiar PORT en .env o
lsof -i :3000  # Encontrar proceso
kill -9 <PID>  # Matar proceso
```

---

**Siguiente**: [Seguridad WebSocket →](../websocket/security.md)
