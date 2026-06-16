# Laboratory Reviews - Post Message System

Sistema de gestión de posts y comentarios con backend en NestJS, frontend en Angular 18 y documentación con Docusaurus.

## 🏗️ Estructura del Proyecto

```
laboratory-reviews/
├── backend-post-message-nestjs/      # API backend (NestJS)
├── frontend-post-message-angular/    # Aplicación web (Angular 18)
├── docs-post-message/                # Documentación (Docusaurus)
└── README.md                          # Este archivo
```

## 📋 Requisitos Previos

- **Node.js** >= 16.0.0 (recomendado 22.x)
- **npm** >= 8.0.0
- **MongoDB** (base de datos local o conectada)
- **Git**

## 🚀 Comenzar en Local

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd laboratory-reviews
```

### 2. Backend (NestJS)

```bash
cd backend-post-message-nestjs

# Instalar dependencias
npm install

# Configurar variables de entorno (crear archivo .env)
# Edita el archivo .env con tu configuración de MongoDB y otros parámetros
cp .env.example .env  # Si existe

# Iniciar en modo desarrollo (con hot-reload)
npm run dev

# O compilar y ejecutar en producción
npm run build
npm run start:prod
```

**Puertos por defecto:**
- API: `http://localhost:3000`
- Swagger API Docs: `http://localhost:3000/api/docs`

### 3. Frontend (Angular)

En otra terminal:

```bash
cd frontend-post-message-angular

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start

# O con el compilador en watch mode
npm run watch
```

**Puertos por defecto:**
- Aplicación: `http://localhost:4200`

### 4. Documentación (Docusaurus)

En otra terminal:

```bash
cd docs-post-message

# Instalar dependencias
npm install

# Iniciar servidor de documentación
npm start

# O compilar para producción
npm run build
npm run serve
```

**Puertos por defecto:**
- Docs: `http://localhost:3000`

## 📦 Scripts Disponibles

### Backend

| Script | Descripción |
|--------|------------|
| `npm run dev` | Iniciar en modo desarrollo con hot-reload |
| `npm run build` | Compilar TypeScript |
| `npm start` | Ejecutar aplicación compilada |
| `npm run start:prod` | Ejecutar en producción |
| `npm test` | Ejecutar tests unitarios |
| `npm run test:watch` | Tests en watch mode |
| `npm run test:cov` | Tests con cobertura |
| `npm run test:e2e` | Tests end-to-end |
| `npm run lint` | Ejecutar ESLint y auto-corregir |
| `npm run format` | Formatear código con Prettier |

### Frontend

| Script | Descripción |
|--------|------------|
| `npm start` | Iniciar dev server |
| `npm run build` | Compilar para producción |
| `npm run watch` | Compilar en watch mode |
| `npm test` | Ejecutar tests unitarios (Karma) |
| `npm run e2e` | Ejecutar tests E2E (Cypress) |
| `npm run e2e:open` | Abrir Cypress en modo interactivo |

### Documentación

| Script | Descripción |
|--------|------------|
| `npm start` | Iniciar servidor de desarrollo |
| `npm run build` | Compilar documentación estática |
| `npm run serve` | Servir documentación compilada |

## 🔧 Variables de Entorno

Crea un archivo `.env` en `backend-post-message-nestjs/` con:

```env
# Base de datos MongoDB
MONGODB_URI=mongodb://localhost:27017/laboratory-reviews

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=3600

# MinIO (almacenamiento de archivos)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=laboratory-reviews

# Puerto de la aplicación
PORT=3000
```

## 🧪 Testing

### Backend
```bash
cd backend-post-message-nestjs

# Tests unitarios
npm test

# Tests con coverage
npm run test:cov

# Tests end-to-end
npm run test:e2e
```

### Frontend
```bash
cd frontend-post-message-angular

# Tests unitarios (Karma)
npm test

# Tests E2E (Cypress)
npm run e2e
npm run e2e:open  # Modo interactivo
```

## 📚 Documentación

La documentación del proyecto está disponible en `docs-post-message/` usando Docusaurus. Incluye:

- **Backend**: Arquitectura, módulos, guías de setup
- **Frontend**: Estructura, servicios, features
- **Guías generales**: Docker, variables de entorno, testing

Visualiza la documentación ejecutando:
```bash
cd docs-post-message
npm start
```

## 🐳 Docker (Recomendado)

La forma más fácil de tener todo corriendo es con Docker Compose. Todos los servicios se inician juntos y conectados automáticamente.

### Opción 1: Script automático (recomendado)

**En Linux/Mac:**
```bash
chmod +x docker-start.sh
./docker-start.sh
```

**En Windows:**
```bash
# Ejecuta en PowerShell o CMD
docker-compose build --no-cache
docker-compose up -d
```

### Opción 2: Comandos manuales

```bash
# Compilar todas las imágenes (primera vez)
docker-compose build

# Ejecutar servicios en background
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Detener servicios
docker-compose down

# Detener y eliminar datos (cuidado: pierdes la BD)
docker-compose down -v
```

### Configuración (Opcional)

Si quieres cambiar las credenciales de MongoDB o MinIO, crea un archivo `.env`:

```bash
# Copia el template
cp docker-compose.env.template .env

# Edita .env con tus valores
# MONGO_ROOT_USER=tu_usuario
# MONGO_ROOT_PASSWORD=tu_contraseña
```

### Acceso a Servicios con Docker

Una vez que todo esté corriendo:

| Servicio | URL | Usuario | Contraseña |
|----------|-----|---------|-----------|
| 🎨 Frontend | http://localhost:3024 | - | - |
| 🔧 Backend API | http://localhost:3025 | - | - |
| 📚 Swagger Docs | http://localhost:3025/api | - | - |
| 💾 Mongo Express | http://localhost:8083 | admin | admin |
| 🪣 MinIO Console | http://localhost:9001 | minioadmin | minioadmin |
| 📖 Documentación | http://localhost:3026 | - | - |

### MongoDB en Docker

```bash
# Conectar a MongoDB desde terminal
docker exec -it laboratory_mongo mongosh -u admin -p admin123

# URI para conectar desde apps locales
mongodb://admin:admin123@localhost:27019/laboratory-reviews
```

### Troubleshooting Docker

```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs angular-app      # Frontend
docker-compose logs nestjs-app       # Backend
docker-compose logs mongodb          # MongoDB

# Reconstruir una imagen específica
docker-compose build --no-cache angular-app

# Limpiar todo (cuidado: borra datos)
docker-compose down -v
docker system prune -a
```

## 🔍 Accesos Rápidos

Una vez que todo esté corriendo:

- **Frontend**: http://localhost:4200
- **API Backend**: http://localhost:3000
- **Swagger API Docs**: http://localhost:3000/api/docs
- **Documentación**: http://localhost:3000

## 📝 Convenciones del Proyecto

- **Backend**: NestJS + TypeScript + Mongoose
- **Frontend**: Angular 18 + NgRx + TailwindCSS
- **Testing**: Jest (backend), Karma + Jasmine (frontend), Cypress (E2E)
- **Code Style**: ESLint + Prettier
- **Documentación**: Docusaurus 3

## 🤝 Contribución

1. Crea una rama con tu feature: `git checkout -b feature/tu-feature`
2. Haz commit de tus cambios: `git commit -m 'Add tu-feature'`
3. Push a la rama: `git push origin feature/tu-feature`
4. Abre un Pull Request

## 📄 Licencia

UNLICENSED

## 💡 Troubleshooting

### El backend no conecta a MongoDB
- Verifica que MongoDB esté corriendo: `mongosh` o el cliente de MongoDB
- Confirma que la `MONGODB_URI` en `.env` sea correcta

### El frontend no conecta al backend
- Asegúrate de que el backend esté corriendo en `http://localhost:3000`
- Revisa la consola del navegador para errores de CORS

### Error al instalar dependencias
- Intenta limpiar la caché: `npm cache clean --force`
- Elimina `node_modules` y `package-lock.json`, luego reinstala: `npm install`

### Puerto ya en uso
- Backend: `lsof -i :3000` (Linux/Mac) o `netstat -ano | findstr :3000` (Windows)
- Frontend: `lsof -i :4200` (Linux/Mac) o `netstat -ano | findstr :4200` (Windows)

---

**¡Listo!** Deberías tener todo corriendo. Si encuentras problemas, revisa la documentación del proyecto o abre un issue.
