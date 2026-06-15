---
sidebar_position: 2
title: Arquitectura en Capas
description: Explicación de la arquitectura en capas de NestJS
---

# Arquitectura en Capas

El backend de Post-Message sigue un patrón de **arquitectura en capas** con clara separación de responsabilidades.

## Descripción General

```mermaid
graph TB
    subgraph "Capa 1: Presentación"
        Controllers["🎮 Controladores"]
        Decorators["@Auth, @CurrentUser, @HasPermission"]
    end
    
    subgraph "Capa 2: Middleware y Aspectos Transversales"
        Guards["🔐 Guards<br/>AuthGuard, PermissionsGuard, WsAuthGuard"]
        Interceptors["🔄 Interceptores<br/>TransformInterceptor"]
        Filters["❌ Filtros<br/>GlobalExceptionFilter"]
        Middleware["🛣️ Middleware<br/>I18nMiddleware"]
    end
    
    subgraph "Capa 3: Aplicación/Lógica de Negocio"
        Services["📦 Servicios<br/>Lógica de negocio, orquestación"]
        UseCases["🎯 Casos de Uso<br/>Operaciones específicas de dominio<br/>(solo Usuarios)"]
    end
    
    subgraph "Capa 4: Dominio y Abstracción de Datos"
        Repositories["📚 Repositorios<br/>Acceso abstracto a datos<br/>(solo Usuarios)"]
    end
    
    subgraph "Capa 5: Infraestructura"
        Models["📊 Modelos Mongoose<br/>Schemas de base de datos"]
        Utils["🧰 Utils<br/>Crypto, Archivos, Strings, Validación"]
        Constants["⚙️ Constantes<br/>Constantes de la aplicación"]
    end
    
    subgraph "Capa 6: Persistencia de Datos"
        Database["🗄️ MongoDB<br/>Almacenamiento de documentos"]
        Storage["☁️ MinIO<br/>Almacenamiento de objetos"]
    end
```

## Detalle de Capas

### Capa 1: Presentación (Controladores)

Los controladores manejan peticiones y respuestas HTTP. Ellos:

- Aceptan peticiones HTTP de los clientes
- Parsean parámetros, cuerpo y headers de las peticiones
- Delegan la lógica de negocio a los Servicios
- Devuelven respuestas HTTP

**Ejemplo**:
```typescript
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  @Auth()  // Decorador personalizado
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.usersService.findUserById(id);
  }
}
```

**Archivos**: `src/app/modules/*/controllers/*.controller.ts`

### Capa 2: Aspectos Transversales

Esta capa provee servicios de infraestructura usados en toda la aplicación:

#### Guards 🔐
Protegen rutas y verifican autenticación/autorización.

```mermaid
graph TB
    Request["Petición HTTP"]
    AuthGuard["AuthGuard<br/>1. Extraer JWT del header<br/>2. Verificar firma<br/>3. Comprobar expiración<br/>4. Adjuntar usuario a la petición"]
    PermGuard["PermissionsGuard<br/>1. Obtener user.role.permissions<br/>2. Comprobar permiso requerido<br/>3. Permitir/Denegar"]
    
    Request --> AuthGuard
    AuthGuard -->|✅ Válido| PermGuard
    AuthGuard -->|❌ Inválido| Reject["Lanzar UnauthorizedException"]
    PermGuard -->|✅ Permitido| Next["Siguiente manejador"]
    PermGuard -->|❌ Denegado| Forbidden["Lanzar ForbiddenException"]
```

**Archivos**:
- `src/app/core/guards/auth.guard.ts` — Verificación JWT
- `src/app/core/guards/permissions.guard.ts` — Aplicación de RBAC
- `src/app/core/guards/ws-auth.guard.ts` — Verificación JWT para WebSocket (sin uso)

#### Interceptores 🔄
Transforman peticiones/respuestas antes de llegar al manejador o después de la respuesta.

```typescript
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map(data => ({
        statusCode: 200,
        data,
        timestamp: new Date(),
        success: true,
      }))
    );
  }
}
```

**Archivos**: `src/app/core/interceptors/transform.interceptor.ts`

#### Filtros ❌
Manejan excepciones globalmente y formatean respuestas de error.

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Extraer tipo de excepción
    // Formatear respuesta de error
    // Devolver JSON con statusCode, message, errors
  }
}
```

**Archivos**: `src/app/core/filters/global-exception.filter.ts`

#### Middleware 🛣️
Procesa peticiones antes de que lleguen a los controladores (ej. detección de idioma).

```typescript
export class I18nMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const language = req.headers['accept-language'] || 'en';
    req['language'] = language;
    next();
  }
}
```

**Archivos**: `src/app/core/middleware/i18n.middleware.ts`

### Capa 3: Aplicación/Lógica de Negocio

#### Servicios 📦
Contienen la lógica de negocio central y orquestan operaciones.

```mermaid
graph TB
    Controller["Controlador"]
    Service["Servicio<br/>- Validar entrada<br/>- Llamar repositorios<br/>- Transformar datos<br/>- Manejar errores"]
    Repository["Repositorio<br/>o Modelo"]
    
    Controller --> Service
    Service --> Repository
```

**Características**:
- Lógica de negocio pura (sin conocimiento de HTTP)
- Pueden probarse de forma independiente
- Deben ser reutilizables entre controladores

**Ejemplo**:
```typescript
@Injectable()
export class UsersService {
  constructor(
    private userRepository: IUserRepository,
    private cryptoUtils: CryptoUtils,
  ) {}

  async createUser(dto: CreateUserDto) {
    const hashedPassword = await this.cryptoUtils.hashPassword(dto.password);
    return this.userRepository.create({
      ...dto,
      password_hash: hashedPassword,
    });
  }
}
```

**Archivos**: `src/app/modules/*/services/*.service.ts`

#### Casos de Uso 🎯 (Solo Módulo Usuarios)
Funciones de lógica de negocio que implementan operaciones específicas de usuario.

```mermaid
graph TB
    Service["UsersService<br/>(Orquestador)"]
    CreateUC["CreateUserUseCase<br/>create(dto)"]
    FindUC["FindUserByIdUseCase<br/>execute(id)"]
    UpdateUC["UpdateUserUseCase<br/>execute(id, dto)"]
    
    Service --> CreateUC
    Service --> FindUC
    Service --> UpdateUC
```

**Archivos**: `src/app/modules/users/use-cases/`

### Capa 4: Dominio y Abstracción de Datos

#### Repositorios 📚 (Solo Módulo Usuarios)
Abstraen la capa de acceso a datos. Implementan el patrón repositorio.

```mermaid
graph TB
    Service["UsersService"]
    IUserRepository["IUserRepository<br/>(Interfaz Abstracta)<br/>- create(user)<br/>- findById(id)<br/>- findByUsername(username)<br/>- update(id, user)<br/>- delete(id)"]
    UserMongoRepository["UserMongoRepository<br/>(Implementación)<br/>- Implementa IUserRepository<br/>- Usa Modelo Mongoose"]
    Model["Modelo Mongoose de Usuario<br/>(MongoDB)"]
    
    Service --> IUserRepository
    IUserRepository -.->|implementa| UserMongoRepository
    UserMongoRepository --> Model
```

**Beneficios**:
- La capa de base de datos está abstraída
- Fácil de cambiar MongoDB por PostgreSQL
- Testeable con repositorios mock

**Archivos**: `src/app/modules/users/repositories/`

### Capa 5: Infraestructura

#### Modelos 📊
Los schemas de Mongoose definen la estructura de los documentos MongoDB.

```typescript
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password_hash: string;

  @Prop({ type: Schema.Types.ObjectId, ref: 'Role' })
  role: Role;
}
```

**Archivos**: `src/app/modules/*/schemas/*.schema.ts`

#### Utils 🧰
Funciones utilitarias reutilizables para operaciones comunes.

- `CryptoUtils` — Hasheo/comparación de contraseñas
- `FileUtils` — Nomenclatura y validación de archivos
- `StringUtils` — Manipulación de cadenas
- `ArrayUtils` — Operaciones con arrays
- `DateUtils` — Formateo de fechas
- `ValidationUtils` — Validación de entradas

**Archivos**: `src/app/core/utils/`

#### Constantes ⚙️
Constantes de la aplicación.

**Archivos**: `src/app/core/constants/`

### Capa 6: Persistencia de Datos

#### MongoDB 🗄️
Base de datos orientada a documentos para almacenar datos de usuarios, posts y comentarios.

#### MinIO ☁️
Almacenamiento de objetos para subida de archivos.

## Ejemplo de Flujo de Datos: Crear Usuario

```mermaid
sequenceDiagram
    participant Client as Cliente
    participant Controller as UsersController
    participant Service as UsersService
    participant UseCase as CreateUserUseCase
    participant Repository as IUserRepository
    participant MongoRepository as UserMongoRepository
    participant Model as Modelo Usuario
    participant MongoDB
    participant Crypto as CryptoUtils
    participant Interceptor as TransformInterceptor
    
    Client->>Controller: POST /users { username, password }
    Controller->>Controller: Validar DTO
    Controller->>Service: createUser(dto)
    Service->>UseCase: execute(dto)
    UseCase->>Crypto: hashPassword(password)
    Crypto->>UseCase: hashedPassword
    UseCase->>Repository: create({ username, password_hash })
    Repository->>MongoRepository: create(data)
    MongoRepository->>Model: Model.create(data)
    Model->>MongoDB: Insertar documento
    MongoDB->>Model: Documento guardado
    Model->>MongoRepository: Devolver usuario
    MongoRepository->>Repository: Devolver usuario
    Repository->>UseCase: Devolver usuario
    UseCase->>Service: Devolver usuario
    Service->>Controller: Devolver usuario
    Controller->>Interceptor: { username, email, ... }
    Interceptor->>Client: { statusCode: 201, data: { ... }, success: true }
```

## Patrones Comunes

### Patrón 1: Inyección de Dependencias
```typescript
@Injectable()
export class MyService {
  constructor(
    private otherService: OtherService,
    private repository: IMyRepository,
  ) {}
}
```

### Patrón 2: Decorador para Metadatos
```typescript
@Controller('users')
@UseGuards(AuthGuard)  // Aplicar guard
@UseInterceptors(TransformInterceptor)  // Aplicar interceptor
export class UsersController {
  @Get(':id')
  @Auth()  // Decorador personalizado
  findOne(@Param('id') id: string) {}
}
```

### Patrón 3: Manejo de Errores
```typescript
try {
  return this.service.doSomething();
} catch (error) {
  throw new BadRequestException(error.message);  // Capturado por GlobalExceptionFilter
}
```

## Responsabilidades por Capa

| Capa | Responsabilidad | Debe Conocer |
|-------|-----------------|-------------------|
| Controlador | Manejo de rutas, aspectos HTTP | HTTP, DTOs, Servicios |
| Servicio | Lógica de negocio, orquestación | Lógica de dominio, Repositorios |
| Caso de Uso | Operaciones de negocio específicas | Lógica de dominio, Repositorio |
| Repositorio | Abstracción de datos | Operaciones de BD, Modelos |
| Modelo | Estructura de datos | Schema de BD, validación |

## Puntos de Violación

⚠️ **La arquitectura actual viola estos principios**:

1. **Los módulos 2-7 omiten las capas de Dominio/Casos de Uso**: Van directamente Servicio → Modelo
2. **WsAuthGuard definido pero sin uso**: No protege las mutaciones WebSocket
3. **Sistemas i18n duales**: Coexisten tanto el servicio Singleton como el Scoped por petición

Ver [Problemas Conocidos](../issues/orphaned-modules.md) para más detalles.

---

**Siguiente**: [Estructura de Módulos →](./module-structure.md)
