# Guía de Despliegue con Docker

## Requisitos previos

- Docker instalado y corriendo
- Docker Compose instalado
- Variables de entorno configuradas en `.env`

## Estructura de Docker

```
backend-post-message-nestjs/
├── Dockerfile              # Multi-stage build optimizado
├── .dockerignore            # Archivos a excluir
└── src/                     # Código fuente

docker-compose.yml          # Orquestación de servicios
```

## Variables de entorno (.env)

Asegúrate de que el archivo `.env` tenga estas variables:

```env
# MongoDB
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=password123
MONGO_DB_NAME=post_message_db

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=uploads

# Node
NODE_PORT=3000
```

## Comandos para ejecutar Docker

### 1. Construir las imágenes

```bash
docker-compose build
```

### 2. Iniciar los servicios

```bash
docker-compose up -d
```

### 3. Ver logs en tiempo real

```bash
# Todos los servicios
docker-compose logs -f

# Solo NestJS
docker-compose logs -f nestjs-app

# Solo MongoDB
docker-compose logs -f mongodb

# Solo MinIO
docker-compose logs -f minio
```

### 4. Verificar estado de los servicios

```bash
docker-compose ps
```

### 5. Detener los servicios

```bash
docker-compose down
```

### 6. Remover volúmenes (CUIDADO: elimina datos)

```bash
docker-compose down -v
```

### 7. Reconstruir y reiniciar

```bash
docker-compose up -d --build
```

## Health Checks

Cada servicio tiene un health check:

- **MongoDB**: Verifica conectividad al puerto 27017
- **MinIO**: Verifica endpoint de salud en puerto 9000
- **NestJS**: Verifica endpoint `/health` en puerto 3000

Verificar estado:

```bash
docker inspect mi_nestjs | grep -A 5 "Health"
```

## Accesos

- **Backend API**: http://localhost:3000
- **MinIO Console**: http://localhost:9001
- **Documentación**: http://localhost:3001
- **MongoDB**: mongodb://localhost:27017 (solo en red local)

## Troubleshooting

### El backend no se inicia

```bash
# Ver logs detallados
docker-compose logs nestjs-app

# Verificar build
docker-compose build --no-cache nestjs-app
```

### MongoDB no responde

```bash
# Verificar conectividad
docker exec mi_nestjs ping mongodb

# Ver logs de MongoDB
docker-compose logs mongodb
```

### MinIO no está disponible

```bash
# Verificar health
docker exec mi_minio curl http://localhost:9000/minio/health/live

# Ver logs
docker-compose logs minio
```

### Problema de permisos o puertos

```bash
# Usar sudo si es necesario
sudo docker-compose up -d

# Cambiar puertos en docker-compose.yml si están ocupados
```

## Arquitectura

```
┌─────────────────────────────────────────┐
│        Docker Network (app-network)      │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────┐  ┌────────────────┐   │
│  │   NestJS    │  │    MongoDB     │   │
│  │   :3000     │  │   :27017       │   │
│  │             │──│  (internal)    │   │
│  └─────────────┘  └────────────────┘   │
│        │                                │
│        │          ┌────────────────┐   │
│        └──────────│    MinIO       │   │
│                   │   :9000 :9001  │   │
│                   └────────────────┘   │
│                                         │
│  ┌─────────────┐                       │
│  │    Docs     │                       │
│  │   :3001     │                       │
│  └─────────────┘                       │
│                                         │
└─────────────────────────────────────────┘
```

## Optimizaciones implementadas

1. **Multi-stage Build**: Reduce tamaño de imagen
2. **Non-root User**: Mejor seguridad
3. **Health Checks**: Monitoreo automático
4. **dumb-init**: Manejo correcto de señales
5. **Custom Network**: Aislamiento y comunicación interna
6. **Production Mode**: NODE_ENV=production

## CI/CD Integration

Para CI/CD (GitHub Actions, GitLab CI, etc.):

```bash
docker-compose -f docker-compose.yml up -d
docker-compose exec -T nestjs-app npm run test
```

## Seguridad

- ✅ Contenedores ejecutados como non-root
- ✅ Imágenes base mantenidas (alpine)
- ✅ Sin contraseñas en el código
- ✅ Red interna aislada
- ✅ Health checks para validar estado
