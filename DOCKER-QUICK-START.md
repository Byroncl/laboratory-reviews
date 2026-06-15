# 🐳 Docker Quick Start Guide

## ¿Qué se ha configurado?

Se ha optimizado tu configuración de Docker para que el backend NestJS se despliegue correctamente:

✅ **Dockerfile optimizado** con multi-stage build
✅ **docker-compose.yml** mejorado con health checks
✅ **Network bridge** para comunicación entre servicios
✅ **Non-root user** para seguridad
✅ **dumb-init** para manejo correcto de señales
✅ **Main.ts actualizado** para escuchar en 0.0.0.0 en producción

## 🚀 Inicio rápido

### Opción 1: Linux/Mac (recomendado)

```bash
cd C:/Users/byron/Documents/laboratory-reviews
chmod +x docker-start.sh
./docker-start.sh
```

### Opción 2: Windows

```bash
cd C:/Users/byron/Documents/laboratory-reviews
docker-start.bat
```

### Opción 3: Manual

```bash
docker-compose build --no-cache
docker-compose up -d
docker-compose logs -f
```

## 📋 Checklist pre-despliegue

- [ ] Docker Desktop está corriendo
- [ ] `.env` existe en la raíz del proyecto
- [ ] Variables en `.env` están correctas:
  - [ ] `MONGO_ROOT_USER=admin`
  - [ ] `MONGO_ROOT_PASSWORD=password123`
  - [ ] `MONGO_DB_NAME=post_message_db`
  - [ ] `MINIO_ROOT_USER=minioadmin`
  - [ ] `MINIO_ROOT_PASSWORD=minioadmin`

## 🎯 Archivos nuevos/modificados

```
backend-post-message-nestjs/
├── Dockerfile              ← NEW: Multi-stage build
├── .dockerignore          ← NEW: Optimización

docker-compose.yml         ← UPDATED: Health checks y networks
DOCKER-DEPLOY.md          ← NEW: Documentación completa
docker-start.sh           ← NEW: Script Linux/Mac
docker-start.bat          ← NEW: Script Windows
DOCKER-QUICK-START.md     ← NEW: Este archivo

src/main.ts               ← UPDATED: HOST=0.0.0.0 en producción
```

## 🔍 Verificar que funciona

### Endpoint de salud (Health Check)

```bash
curl http://localhost:3000/health
```

Esperado: `{"ok":true}` o similar

### API Docs

```
http://localhost:3000/api
```

### Logs en tiempo real

```bash
docker-compose logs -f nestjs-app
```

## 🔧 Comandos útiles

| Comando | Función |
|---------|---------|
| `docker-compose up -d` | Iniciar servicios en background |
| `docker-compose down` | Detener servicios |
| `docker-compose ps` | Ver estado de servicios |
| `docker-compose logs -f` | Ver logs en tiempo real |
| `docker-compose logs nestjs-app` | Ver logs del backend |
| `docker-compose restart nestjs-app` | Reiniciar solo backend |
| `docker-compose down -v` | Detener y eliminar volúmenes |

## 🚨 Troubleshooting

### El backend no responde

```bash
# Ver logs detallados
docker-compose logs nestjs-app

# Verificar que está escuchando
docker exec mi_nestjs netstat -tln | grep 3000

# Reiniciar
docker-compose restart nestjs-app
```

### MongoDB no conecta

```bash
# Verificar logs de MongoDB
docker-compose logs mongodb

# Probar conexión
docker exec mi_nestjs ping mongodb

# Verificar URI en .env
echo $MONGODB_URI
```

### MinIO no está disponible

```bash
# Verificar health
docker exec mi_minio curl http://localhost:9000/minio/health/live

# Ver logs
docker-compose logs minio
```

### Puerto ya en uso

Edita `docker-compose.yml` y cambia el puerto:

```yaml
nestjs-app:
  ports:
    - "3001:3000"  # Cambiar 3001 a otro puerto disponible
```

## 📊 Arquitectura final

```
┌────────────────────────────────────────┐
│     Docker Desktop / Daemon            │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐  │
│  │   app-network (bridge)           │  │
│  │                                  │  │
│  │  ┌────────────┐  ┌────────────┐ │  │
│  │  │  NestJS    │  │  MongoDB   │ │  │
│  │  │  :3000     │──│  :27017    │ │  │
│  │  └────────────┘  └────────────┘ │  │
│  │       │                          │  │
│  │       └──────┬────────────────┐  │  │
│  │              │                │  │  │
│  │         ┌────────────┐  ┌─────┴──┐│  │
│  │         │   MinIO    │  │  Docs  ││  │
│  │         │ :9000:9001 │  │ :3001  ││  │
│  │         └────────────┘  └────────┘│  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

## 🔐 Seguridad

- ✅ Backend ejecuta como usuario `nestjs` (no root)
- ✅ MongoDB sin exposición externa
- ✅ MinIO en red interna
- ✅ Variables sensibles en .env (no en código)
- ✅ Health checks automáticos

## 📞 Endpoints después del despliegue

```
API Backend:        http://localhost:3000
API Documentation:  http://localhost:3000/api
MinIO Console:      http://localhost:9001
Docs Site:          http://localhost:3001
```

## ✅ Próximos pasos

1. Ejecuta `docker-compose up -d`
2. Espera 30-40 segundos a que los servicios inicien
3. Verifica con `curl http://localhost:3000/health`
4. Abre http://localhost:3000/api en el navegador
5. ¡Listo para desarrollar!

---

**Nota**: Si hay problemas, ejecuta:
```bash
docker-compose logs -f
```

para ver los logs en tiempo real y diagnos
ticar el issue.
