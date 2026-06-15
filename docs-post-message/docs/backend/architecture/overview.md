---
sidebar_position: 1
title: Descripción de la Arquitectura
description: Arquitectura de alto nivel del backend de Post-Message
---

# Descripción de la Arquitectura

## Diseño del Sistema

El backend de Post-Message sigue una **arquitectura en capas** con principios parciales de **Arquitectura Limpia** aplicados únicamente al módulo de Usuarios.

```mermaid
graph TB
    subgraph "Capa de Presentación"
        Controllers["🎮 Controladores<br/>Manejan Peticiones HTTP"]
    end
    
    subgraph "Capa de Aplicación"
        Services["📦 Servicios<br/>Lógica de Negocio"]
        Gateways["⚡ Gateways WebSocket<br/>Eventos en Tiempo Real"]
    end
    
    subgraph "Capa de Infraestructura"
        Guards["🔐 Guards<br/>Autenticación/Permisos"]
        Interceptors["🔄 Interceptores<br/>Transformación de Respuestas"]
        Filters["❌ Filtros<br/>Manejo de Excepciones"]
        Middleware["🛣️ Middleware<br/>Preprocesamiento de Peticiones"]
    end
    
    subgraph "Capa de Datos"
        Models["📊 Modelos Mongoose<br/>Schemas de Base de Datos"]
        Database["🗄️ MongoDB<br/>Persistencia de Datos"]
    end
    
    subgraph "Servicios Externos"
        MinIO["☁️ MinIO<br/>Almacenamiento de Archivos"]
    end
    
    Controllers --> Guards
    Controllers --> Services
    Controllers --> Gateways
    
    Services --> Models
    Gateways --> Services
    
    Models --> Database
    Services --> MinIO
    
    Interceptors -.->|Transformar| Controllers
    Filters -.->|Capturar| Controllers
    Middleware -.->|Preprocesar| Controllers
```

## Grafo de Dependencias de Módulos

```mermaid
graph LR
    AppModule["AppModule<br/>Raíz"]
    
    AppModule --> ConfigModule
    AppModule --> MongooseModule
    AppModule --> AuthModule
    AppModule --> UsersModule
    AppModule --> PostsModule
    AppModule --> CommentsModule
    AppModule --> ClientsModule
    AppModule --> FilesModule
    AppModule --> I18nModule
    
    AuthModule --> UsersModule
    AuthModule --> PassportModule
    AuthModule --> JwtModule
    
    CommentsModule --> PostsModule
    
    style AppModule fill:#ff6b6b
    style AuthModule fill:#4ecdc4
    style UsersModule fill:#45b7d1
    style PostsModule fill:#96ceb4
    style CommentsModule fill:#ffeaa7
    style ClientsModule fill:#dfe6e9
    style FilesModule fill:#a29bfe
    style I18nModule fill:#74b9ff
```

## Flujo de una Petición

```mermaid
sequenceDiagram
    participant Client as Cliente
    participant Middleware
    participant Guards as Guards
    participant Controllers as Controladores
    participant Services as Servicios
    participant Database as MongoDB
    participant Response as Interceptor
    
    Client->>Middleware: Petición HTTP
    Middleware->>Middleware: Extrae idioma
    Middleware->>Guards: Middleware pasa la petición
    Guards->>Guards: Verifica JWT
    Guards->>Guards: Comprueba permisos
    Guards->>Controllers: Autenticación exitosa
    Controllers->>Services: Llama a la lógica de negocio
    Services->>Database: Consulta/Actualización
    Database->>Services: Devuelve datos
    Services->>Controllers: Devuelve resultado
    Controllers->>Response: Devuelve respuesta
    Response->>Response: Transforma envelope
    Response->>Client: { statusCode, data, timestamp }
```

## Flujo de Autenticación y Autorización

```mermaid
graph TB
    subgraph "Login"
        LoginCtrl["POST /auth/login<br/>username + password"]
        AuthService["AuthService<br/>bcrypt.compare()"]
        JwtService["JwtService<br/>sign(payload)"]
        Token["Token JWT<br/>{ userId, type, role }"]
    end
    
    subgraph "Ruta Protegida"
        Request["GET /api/protected<br/>Authorization: Bearer {token}"]
        AuthGuard["AuthGuard<br/>Verificar JWT"]
        PermGuard["PermissionsGuard<br/>Comprobar permisos"]
        Handler["Manejador de Ruta<br/>@Auth() @HasPermission()"]
    end
    
    subgraph "Respuesta"
        TransformInterceptor["TransformInterceptor<br/>Envolver respuesta"]
        Final["{ statusCode, data, timestamp }"]
    end
    
    LoginCtrl --> AuthService
    AuthService --> JwtService
    JwtService --> Token
    
    Request --> AuthGuard
    AuthGuard --> PermGuard
    PermGuard --> Handler
    Handler --> TransformInterceptor
    TransformInterceptor --> Final
    
    style LoginCtrl fill:#ff7675
    style Token fill:#00b894
    style Handler fill:#0984e3
    style Final fill:#fdcb6e
```

## Módulo de Usuarios: Patrón de Arquitectura Limpia

Solo el **módulo de Usuarios** implementa la Arquitectura Limpia completa:

```mermaid
graph TB
    subgraph "Módulo de Usuarios"
        Controller["UsersController<br/>(Presentación)"]
        
        subgraph "Capa de Aplicación"
            Service["UsersService<br/>(Orquestador)"]
            UseCases["Casos de Uso<br/>CreateUserUseCase<br/>FindUserByIdUseCase<br/>UpdateUserUseCase"]
        end
        
        subgraph "Capa de Dominio"
            Repository["IUserRepository<br/>(Abstracto)"]
        end
        
        subgraph "Capa de Infraestructura"
            MongoRepo["UserMongoRepository<br/>(Implementación)"]
            Model["Modelo Mongoose de Usuario"]
        end
    end
    
    Controller --> Service
    Service --> UseCases
    UseCases --> Repository
    Repository -.->|implementa| MongoRepo
    MongoRepo --> Model
```

## Otros Módulos: Patrón Plano

El resto de módulos omite las capas de dominio y casos de uso:

```mermaid
graph TB
    subgraph "Módulo Posts (Plano)"
        Controller["PostsController"]
        Service["PostsService"]
        Model["Modelo Mongoose de Post"]
    end
    
    Controller -->|Directo| Service
    Service -->|Directo| Model
    
    style Controller fill:#74b9ff
    style Service fill:#74b9ff
    style Model fill:#74b9ff
```

## Componentes de la Infraestructura Central

### Guards

Protege las rutas con autenticación y autorización:

```mermaid
graph LR
    Request["Petición Entrante"]
    
    subgraph "Cadena de Guards"
        AuthGuard["🔐 AuthGuard<br/>Verificar JWT"]
        PermGuard["🛡️ PermissionsGuard<br/>Comprobar Permisos"]
        WsAuthGuard["⚡ WsAuthGuard<br/>Auth WebSocket<br/>(sin uso)"]
    end
    
    Proceed["✅ Petición Permitida"]
    Reject["❌ Error 401/403"]
    
    Request --> AuthGuard
    AuthGuard -->|Válido| PermGuard
    AuthGuard -->|Inválido| Reject
    PermGuard -->|Permitido| Proceed
    PermGuard -->|Denegado| Reject
```

### Transformación de Respuestas

```mermaid
graph TB
    Endpoint["Manejador de Ruta<br/>devuelve: { name, email }"]
    Interceptor["TransformInterceptor<br/>Envuelve la respuesta"]
    
    Response["<br/>{\n  statusCode: 200,<br/>  data: { name, email },<br/>  timestamp: '2024-06-13...',<br/>  success: true<br/>}"]
    
    Endpoint --> Interceptor
    Interceptor --> Response
    
    style Response fill:#fdcb6e
```

### Manejo de Excepciones

```mermaid
graph TB
    Error["Excepción Lanzada<br/>en el Manejador de Ruta"]
    Filter["GlobalExceptionFilter<br/>Captura todas las excepciones"]
    
    NotValidation["Error no de validación"]
    ValidationError["Error de Validación"]
    
    Response1["{ statusCode, message,<br/>timestamp, success: false }"]
    Response2["{ statusCode, message,<br/>errors: [], success: false }"]
    
    Error --> Filter
    Filter --> NotValidation
    Filter --> ValidationError
    NotValidation --> Response1
    ValidationError --> Response2
    
    style Error fill:#d63031
    style Filter fill:#ff7675
```

## Capa de Datos

### Relaciones entre Entidades

```mermaid
erDiagram
    USER ||--o{ POST : "crea"
    USER ||--o{ COMMENT : "tiene"
    USER ||--|| ROLE : "asignado"
    POST ||--o{ COMMENT : "tiene"
    ROLE ||--o{ PERMISSION : "otorga"
    
    USER {
        ObjectId id
        string username "único"
        string email "único"
        string password_hash
        string type "admin, user, client"
        boolean isActive
        ObjectId role
        string preferredLanguage
    }
    
    POST {
        ObjectId id
        string title
        string body
        ObjectId author
        string imageUrl
        boolean isActive
    }
    
    COMMENT {
        ObjectId id
        ObjectId postId
        string name
        string email
        string body
        boolean isActive
    }
    
    ROLE {
        ObjectId id
        string name
        string identifier
        boolean isActive
        array permissions
    }
    
    PERMISSION {
        ObjectId id
        string name
        string identifier
        string type
        boolean isActive
    }
```

## Arquitectura de Almacenamiento de Archivos

```mermaid
graph TB
    Client["Frontend<br/>Subir Archivo"]
    Controller["FilesController<br/>@Post('/upload')"]
    Service["FilesService"]
    MinIO["MinIO<br/>Object Storage"]
    FileRecord["Metadatos del Archivo<br/>filename, url"]
    
    Client -->|multipart/form-data| Controller
    Controller -->|Validar| Service
    Service -->|Put object| MinIO
    Service -->|Guardar referencia| FileRecord
    FileRecord -->|Devolver URL pública| Client
    
    style MinIO fill:#ff9f43
    style FileRecord fill:#74b9ff
```

## Comunicación en Tiempo Real (WebSocket)

```mermaid
graph TB
    Client1["Cliente 1"]
    Client2["Cliente 2"]
    
    subgraph "Servidor Socket.IO"
        Gateway["CommentsGateway<br/>namespace /comments"]
        Events["Manejadores de Eventos<br/>user:register<br/>comment:create<br/>comment:update<br/>comments:list"]
        Service["CommentsService"]
    end
    
    Database["MongoDB<br/>Colección Comments"]
    
    Client1 -->|emitir evento| Gateway
    Client2 -->|emitir evento| Gateway
    Gateway --> Events
    Events --> Service
    Service --> Database
    Service -->|broadcast| Gateway
    Gateway -->|emitir evento| Client1
    Gateway -->|emitir evento| Client2
    
    style Gateway fill:#00b894
    style Events fill:#00b894
```

## Consideraciones de Rendimiento

1. **Indexación de Base de Datos**: Asegurar índices en campos consultados frecuentemente
   - `users.username` (único)
   - `users.email` (único)
   - `roles.identifier` (único)
   - `posts.author` (clave foránea)
   - `comments.postId` (clave foránea)

2. **Paginación**: Usar `PaginationService` (actualmente sin uso) para conjuntos de datos grandes

3. **Caché**: Aún no implementado; considerar Redis para almacenamiento de sesiones

4. **Almacenamiento de Archivos**: MinIO provee object storage con consistencia eventual

## Capas de Seguridad

```mermaid
graph TB
    Request["Petición Entrante"]
    HTTPS["HTTPS/TLS<br/>Seguridad en Transporte"]
    CORS["Validación CORS<br/>Verificación de Origen"]
    Auth["Verificación JWT<br/>Firma + Expiración"]
    Perms["Comprobación de Permisos<br/>RBAC"]
    Validation["Validación de Entrada<br/>class-validator"]
    
    Request --> HTTPS
    HTTPS --> CORS
    CORS --> Auth
    Auth --> Perms
    Perms --> Validation
    Validation -->|✅ Permitido| Handler["Manejador de Ruta"]
    
    style HTTPS fill:#00b894
    style Auth fill:#0984e3
    style Perms fill:#6c5ce7
```

## Arquitectura de Despliegue

```mermaid
graph LR
    subgraph "Cliente"
        Browser["🌐 Navegador<br/>App Angular"]
    end
    
    subgraph "Servidor"
        Node["🚀 NestJS<br/>Node.js"]
    end
    
    subgraph "Datos"
        Mongo["🗄️ MongoDB"]
    end
    
    subgraph "Almacenamiento"
        Minio["☁️ MinIO"]
    end
    
    Browser -->|HTTP/WebSocket| Node
    Node -->|Consulta| Mongo
    Node -->|Object Store| Minio
```

---

**Siguiente**: [Capas →](./layers.md)
