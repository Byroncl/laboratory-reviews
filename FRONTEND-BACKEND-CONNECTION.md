# 🔌 Guía de Conexión Frontend-Backend en Docker

## ✅ Cambios realizados

### 1. Backend (NestJS) - Prefijo Global /api

**Archivo**: `backend-post-message-nestjs/src/main.ts`

```typescript
// Global API prefix - debe estar antes de setupSwagger
app.setGlobalPrefix('api');
```

Ahora todas las rutas están bajo `/api`:
- `/api/posts` ✓
- `/api/users` ✓
- `/api/auth` ✓
- `/api/roles` ✓

### 2. Frontend (Angular) - URL Base Correcta

**Archivo**: `frontend-post-message-angular/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://host.docker.internal:3000',
  socketUrl: 'http://host.docker.internal:3000',
};
```

**¿Por qué `host.docker.internal`?**
- Es una IP especial en Docker que permite acceder al host desde dentro del contenedor
- Funciona en Docker Desktop (Windows/Mac)
- En Linux, debe configurarse manualmente en el docker-compose.yml

### 3. Docusaurus (Nginx) - Configuración Mejorada

**Archivo**: `docs-post-message/Dockerfile`

Mejoras:
- ✅ Configuración correcta de Nginx para SPA
- ✅ Gzip compression
- ✅ Cache headers para assets estáticos
- ✅ SPA routing (cualquier ruta va a index.html)
- ✅ Security headers
- ✅ Health check en `/docs/`

## 🚀 Pruebas de Conexión

### 1. Verificar Backend

```bash
# Health check
curl http://localhost:3000/api/health

# Obtenido esperado:
# {"ok":true,"status":"OK"}
```

### 2. Verificar Conexión desde Frontend

Abre en el navegador:
```
http://localhost:4200
```

Abre DevTools (F12) → Network tab

Deberías ver:
- ✅ `http://localhost:3000/api/posts` - 200 OK
- ✅ No más errores 404

### 3. Verificar Docusaurus

```bash
curl http://localhost:3001

# Deberías obtener HTML de Docusaurus (sin 403)
```

Abre en navegador:
```
http://localhost:3001/docs/
```

## 🐳 En Docker Desktop

Cuando ejecutes con Docker:

```bash
docker-compose up -d
```

- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:4200 (o `npm run serve`)
- **Docusaurus**: http://localhost:3001/docs/
- **MinIO**: http://localhost:9001

## 📋 Estructura de URLs

```
┌─ http://localhost:3000
│  ├─ /api/posts
│  ├─ /api/users
│  ├─ /api/auth
│  └─ /health
│
├─ http://localhost:4200 (Frontend Angular)
│
├─ http://localhost:3001 (Docusaurus)
│  └─ /docs/
│
└─ http://localhost:9001 (MinIO)
```

## 🔍 Troubleshooting

### Frontend muestra 404 en requests

**Síntoma**: Network tab muestra `GET http://localhost:3000/api/posts 404 Not Found`

**Solución**:
```bash
# 1. Rebuildar backend
docker-compose build --no-cache nestjs-app

# 2. Reiniciar servicios
docker-compose restart nestjs-app

# 3. Verificar logs
docker-compose logs nestjs-app
```

### Docusaurus muestra 403 Forbidden

**Síntoma**: `403 Forbidden nginx/1.31.1`

**Solución**:
```bash
# 1. Rebuildar docs
docker-compose build --no-cache docs

# 2. Detener y reiniciar
docker-compose restart docs

# 3. Verificar logs
docker-compose logs docs

# 4. Verificar salud
curl -v http://localhost:3001/docs/
```

### Frontend no puede conectar al backend

**Síntoma**: CORS errors o connection refused

**Soluciones por plataforma**:

**Windows/Mac (Docker Desktop)**:
```typescript
// Ya está configurado correctamente
apiUrl: 'http://host.docker.internal:3000'
```

**Linux**:
```bash
# En docker-compose.yml, agrega en nestjs-app:
extra_hosts:
  - "host.docker.internal:host-gateway"
```

```typescript
// Frontend environment.ts
apiUrl: 'http://host.docker.internal:3000'
```

## 🔐 CORS Configurado

El backend tiene CORS habilitado:

```typescript
// src/bootstrap/cors.ts
app.enableCors({
  origin: true,  // Permite cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: '*',
  credentials: true,
});
```

## 📊 Flujo de una Request

```
Angular App (localhost:4200)
    ↓
ApiService hace GET /posts
    ↓
URL completa: http://host.docker.internal:3000/api/posts
    ↓
Resuelve a: http://localhost:3000/api/posts (en Docker host)
    ↓
NestJS Backend recibe en /api/posts
    ↓
PostsController procesa
    ↓
Respuesta JSON 200 OK
    ↓
Angular actualiza vista
```

## ✨ Comandos útiles

```bash
# Ver todas las URLs configuradas
grep -r "apiUrl\|socketUrl" frontend-post-message-angular/src/

# Verificar CORS configuration
grep -r "enableCors" backend-post-message-nestjs/src/

# Verificar prefijo global
grep -r "setGlobalPrefix" backend-post-message-nestjs/src/

# Logs de todos los servicios
docker-compose logs -f

# Logs solo del backend
docker-compose logs -f nestjs-app

# Logs solo del frontend
docker-compose logs -f docs
```

## 🎯 Checklist Final

- [ ] Backend tiene `app.setGlobalPrefix('api')`
- [ ] Frontend usa `apiUrl: 'http://host.docker.internal:3000'`
- [ ] CORS está habilitado en backend
- [ ] Docusaurus Dockerfile tiene configuración de Nginx corregida
- [ ] `docker-compose up -d` ejecuta sin errores
- [ ] `curl http://localhost:3000/api/health` retorna 200
- [ ] Frontend carga en `http://localhost:4200`
- [ ] Network tab del frontend muestra requests a `/api/*`
- [ ] Docusaurus carga en `http://localhost:3001/docs/`

## 📞 Próximos pasos

1. **Rebuildar y reiniciar**:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

2. **Verificar con curl**:
   ```bash
   curl http://localhost:3000/api/posts
   ```

3. **Abriren navegador**:
   - Frontend: http://localhost:4200
   - API Docs: http://localhost:3000/api
   - Docs: http://localhost:3001/docs/

4. **Monitorear logs**:
   ```bash
   docker-compose logs -f
   ```

---

**Nota**: Si tienes más problemas, ejecuta `docker-compose logs -f` y búscalo en la sección de Troubleshooting.
