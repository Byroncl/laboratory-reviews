# Test Coverage - Backend

Documentación completa de todos los tests unitarios del backend NestJS. El proyecto contiene **70 tests** cubriendo diferentes capas de la aplicación.

## Ejecutar Tests

```bash
# Tests unitarios
npm test

# Tests con coverage
npm run test:cov

# Tests end-to-end
npm run test:e2e

# Watch mode
npm run test:watch

# Debug
npm run test:debug
```

## Categorías de Tests

### 1. Core - Decorators (3 tests)

**Ubicación:** `src/app/core/decorators/`

#### `auth.decorator.spec.ts`
- Verifica que el decorador `@Auth()` se aplique correctamente a métodos
- Valida que se almacene en metadatos

#### `is-strong-password.decorator.spec.ts`
- Prueba validación de contraseñas fuertes
- Verifica reglas de complejidad (mayúsculas, números, caracteres especiales)

### 2. Core - Guards (2 tests)

**Ubicación:** `src/app/core/guards/`

#### `jwt-auth.guard.spec.ts`
- Verifica autenticación JWT
- Prueba tokens válidos e inválidos
- Valida acceso a rutas protegidas

#### `ws-auth.guard.spec.ts`
- Protección de WebSocket
- Validación de conexiones autenticadas

### 3. Core - Filters (1 test)

**Ubicación:** `src/app/core/filters/`

#### `global-exception.filter.spec.ts`
- Manejo global de excepciones
- Verifica transformación de errores a respuestas HTTP
- Validación de códigos de estado

### 4. Core - Interceptors (1 test)

**Ubicación:** `src/app/core/interceptors/`

#### `transform.interceptor.spec.ts`
- Transformación de respuestas
- Envuelve respuestas en formato estándar
- Manejo de errores

### 5. Core - Pipes (1 test)

**Ubicación:** `src/app/core/pipes/`

#### `file-validation.pipe.spec.ts`
- Validación de archivos subidos
- Verifica tipos MIME permitidos
- Valida tamaño máximo

### 6. Core - Middleware (1 test)

**Ubicación:** `src/app/core/middleware/`

#### `i18n.middleware.spec.ts`
- Detección de idioma
- Parseo de headers `Accept-Language`
- Fallback a idioma por defecto

### 7. Core - Services (2 tests)

**Ubicación:** `src/app/core/services/`

#### `pagination.service.spec.ts`
- Cálculo de offset y limit
- Validación de parámetros
- Respuestas paginadas

#### `query.service.spec.ts`
- Construcción de queries MongoDB
- Filtrado dinámico
- Sorting y búsqueda

### 8. Core - I18N (1 test)

**Ubicación:** `src/app/core/i18n/`

#### `i18n.service.spec.ts`
- Carga de traducciones
- Fallback de idiomas
- Traducción de mensajes

### 9. Core - DTOs (2 tests)

**Ubicación:** `src/app/core/dto/`

#### `api.response.spec.ts`
- Estructura de respuesta API estándar
- Validación de campos requeridos

#### `pagination.dto.spec.ts`
- Validación de parámetros de paginación
- Límites mínimos y máximos

### 10. Core - Exceptions (1 test)

**Ubicación:** `src/app/core/exceptions/`

#### `app.exceptions.spec.ts`
- Excepciones personalizadas
- Códigos de error
- Mensajes descriptivos

### 11. Core - Plugins (1 test)

**Ubicación:** `src/app/core/plugins/`

#### `mongoose-audit.plugin.spec.ts`
- Auditoría automática de cambios
- Registro de creación/actualización
- Timestamps automáticos

### 12. Core - Bootstrap (1 test)

**Ubicación:** `src/bootstrap/`

#### `cors.spec.ts`
- Configuración CORS
- Validación de orígenes permitidos
- Métodos HTTP permitidos

### 13. Application (1 test)

**Ubicación:** `src/app/`

#### `app.controller.spec.ts`
- Endpoint raíz `/`
- Health check

## Módulos - Auth (5 tests)

**Ubicación:** `src/app/modules/auth/`

### Controllers
#### `auth.controller.spec.ts`
- Endpoint de registro (POST /auth/register)
- Endpoint de login (POST /auth/login)
- Endpoint de refresh token (POST /auth/refresh)
- Validación de credenciales

### Use Cases
#### `login.use-case.spec.ts`
- Lógica de autenticación
- Validación de usuario/contraseña
- Generación de JWT

#### `validate-user.use-case.spec.ts`
- Validación de usuario existente
- Verificación de contraseña
- Estados activos/inactivos

### Repositories
#### `auth-user.repository.spec.ts`
- Búsqueda de usuario por email
- Búsqueda por ID
- Operaciones CRUD

## Módulos - Users (4 tests)

**Ubicación:** `src/app/modules/users/`

### Service
#### `users.service.spec.ts`
- Crear usuario
- Actualizar perfil
- Búsqueda y filtrado
- Cambio de contraseña
- Eliminación (soft delete)

### Controller
#### `users.controller.spec.ts`
- GET /users (listar)
- GET /users/:id (detalle)
- PUT /users/:id (actualizar)
- DELETE /users/:id (eliminar)

### Repository
#### `user-mongo.repository.spec.ts`
- Operaciones de base de datos
- Validaciones Mongoose
- Índices

### DTO
#### `create-user.dto.spec.ts`
- Validación de campos
- Email único
- Contraseña fuerte

## Módulos - Posts (3 tests)

**Ubicación:** `src/app/modules/posts/`

### Service
#### `posts.service.spec.ts`
- Crear post
- Actualizar post
- Publicar/unpublish
- Listar con paginación
- Eliminar post

### Controller
#### `posts.controller.spec.ts`
- Endpoints CRUD
- Validación de autorización
- Respuestas paginadas

### Reactions Service
#### `reactions.service.spec.ts`
- Agregar reacción (like, love, etc)
- Remover reacción
- Contar reacciones por tipo

## Módulos - Comments (3 tests)

**Ubicación:** `src/app/modules/comments/`

### Gateway
#### `comments.gateway.spec.ts`
- Conexión WebSocket
- Eventos en tiempo real
- Notificaciones de comentarios

### Service
#### `comments.service.spec.ts`
- Crear comentario
- Responder comentario
- Editar comentario
- Eliminar comentario

### Schema
#### `reaction.schema.spec.ts`
- Validación de schema Mongoose
- Tipos de reacción válidos
- Índices

## Módulos - Files (2 tests)

**Ubicación:** `src/app/modules/files/`

### Controller
#### `files.controller.spec.ts`
- Upload de archivo (POST /files/upload)
- Descarga de archivo (GET /files/:id)
- Eliminación de archivo (DELETE /files/:id)

### Service
#### `files.service.spec.ts`
- Almacenamiento en MinIO
- Generación de URLs
- Validación de tipos

## Módulos - Permissions (3 tests)

**Ubicación:** `src/app/modules/permissions/`

### Service
#### `permissions.service.spec.ts`
- Crear permiso
- Verificar permisos de usuario
- Listar permisos

### Controller
#### `permissions.controller.spec.ts`
- CRUD de permisos
- Asignación a roles

### DTO
#### `create-permission.dto.spec.ts`
- Validación de nombre único
- Descripción requerida

## Módulos - Roles (2 tests)

**Ubicación:** `src/app/modules/roles/`

### Service
#### `roles.service.spec.ts`
- CRUD de roles
- Asignación de permisos
- Roles por defecto

### Controller
#### `roles.controller.spec.ts`
- Endpoints CRUD
- Validación de autorización

## Módulos - Clients (1 test)

**Ubicación:** `src/app/modules/clients/`

#### `clients.service.spec.ts`
- Crear cliente OAuth
- Generar credenciales
- Validar cliente

## Módulos - Categories (1 test)

**Ubicación:** `src/app/modules/categories/`

#### `categories.service.spec.ts`
- CRUD de categorías
- Categorías por módulo
- Validación de unicidad

## Módulos - I18N (1 test)

**Ubicación:** `src/app/modules/i18n/`

#### `i18n.service.spec.ts`
- Cargar traducciones
- Validar keys
- Fallback de idiomas

## Módulos - Notifications (1 test)

**Ubicación:** `src/app/modules/notifications/`

#### `notifications.service.spec.ts`
- Crear notificación
- Marcar como leída
- Listar notificaciones

## Resumen por Tipo

| Tipo | Cantidad | Descripción |
|------|----------|-------------|
| Services | 20+ | Lógica de negocio |
| Controllers | 15+ | Endpoints HTTP |
| Guards | 2 | Autenticación |
| Filters | 1 | Manejo de excepciones |
| Decorators | 2 | Metadatos |
| Pipes | 1 | Validación |
| Interceptors | 1 | Transformación |
| Middleware | 1 | Procesamiento de requests |
| Repositories | 3+ | Acceso a datos |
| DTOs | 5+ | Validación de entrada |
| **Total** | **70** | **Cobertura completa** |

## Modos de Testing

### Unit Tests
- Aislamiento de componentes
- Mocks de dependencias
- Jest como framework

### Integration Tests
- Interacción entre módulos
- Base de datos en memoria
- Más lento pero más realista

### E2E Tests
- Flujos completos
- Requests HTTP reales
- Validación end-to-end

## Coverage

Para ver el reporte de cobertura:

```bash
npm run test:cov
# Abre: coverage/index.html
```

## Mejores Prácticas

✅ **Haz:**
- Un test por comportamiento
- Nombres descriptivos (`should do X when Y`)
- Mocks claros y explícitos
- Arrange-Act-Assert

❌ **No hagas:**
- Tests que dependan entre sí
- Lógica compleja en los tests
- Mocks innecesarios
- Ignorar fallos (`.skip`)

## Ejecutar Tests Específicos

```bash
# Un archivo
npm test -- auth.controller.spec.ts

# Un describe
npm test -- -t "auth controller"

# Con patrón
npm test -- --testPathPattern="modules/auth"
```

---

**Última actualización:** Junio 2026  
**Total de tests:** 70  
**Cobertura objetivo:** 80%+
