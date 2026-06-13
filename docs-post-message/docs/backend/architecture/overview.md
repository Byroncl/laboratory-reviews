---
sidebar_position: 1
title: Architecture Overview
description: High-level architecture of the Post-Message backend
---

# Architecture Overview

## System Design

The Post-Message backend follows a **layered architecture** with partial **Clean Architecture** principles applied only to the Users module.

```mermaid
graph TB
    subgraph "Presentation Layer"
        Controllers["🎮 Controllers<br/>Handle HTTP Requests"]
    end
    
    subgraph "Application Layer"
        Services["📦 Services<br/>Business Logic"]
        Gateways["⚡ WebSocket Gateways<br/>Real-time Events"]
    end
    
    subgraph "Infrastructure Layer"
        Guards["🔐 Guards<br/>Auth/Permissions"]
        Interceptors["🔄 Interceptors<br/>Response Transform"]
        Filters["❌ Filters<br/>Exception Handling"]
        Middleware["🛣️ Middleware<br/>Request Preprocessing"]
    end
    
    subgraph "Data Layer"
        Models["📊 Mongoose Models<br/>Database Schemas"]
        Database["🗄️ MongoDB<br/>Data Persistence"]
    end
    
    subgraph "External Services"
        MinIO["☁️ MinIO<br/>File Storage"]
    end
    
    Controllers --> Guards
    Controllers --> Services
    Controllers --> Gateways
    
    Services --> Models
    Gateways --> Services
    
    Models --> Database
    Services --> MinIO
    
    Interceptors -.->|Transform| Controllers
    Filters -.->|Catch| Controllers
    Middleware -.->|Preprocess| Controllers
```

## Module Dependency Graph

```mermaid
graph LR
    AppModule["AppModule<br/>Root"]
    
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

## Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant Middleware
    participant Guards
    participant Controllers
    participant Services
    participant Database as MongoDB
    participant Response as Interceptor
    
    Client->>Middleware: HTTP Request
    Middleware->>Middleware: Extract language
    Middleware->>Guards: Middleware passes request
    Guards->>Guards: Verify JWT
    Guards->>Guards: Check permissions
    Guards->>Controllers: Auth success
    Controllers->>Services: Call business logic
    Services->>Database: Query/Update
    Database->>Services: Return data
    Services->>Controllers: Return result
    Controllers->>Response: Return response
    Response->>Response: Transform envelope
    Response->>Client: { statusCode, data, timestamp }
```

## Authentication & Authorization Flow

```mermaid
graph TB
    subgraph "Login"
        LoginCtrl["POST /auth/login<br/>username + password"]
        AuthService["AuthService<br/>bcrypt.compare()"]
        JwtService["JwtService<br/>sign(payload)"]
        Token["JWT Token<br/>{ userId, type, role }"]
    end
    
    subgraph "Protected Route"
        Request["GET /api/protected<br/>Authorization: Bearer {token}"]
        AuthGuard["AuthGuard<br/>Verify JWT"]
        PermGuard["PermissionsGuard<br/>Check permissions"]
        Handler["Route Handler<br/>@Auth() @HasPermission()"]
    end
    
    subgraph "Response"
        TransformInterceptor["TransformInterceptor<br/>Wrap response"]
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

## Users Module: Clean Architecture Pattern

Only the **Users module** implements full Clean Architecture:

```mermaid
graph TB
    subgraph "Users Module"
        Controller["UsersController<br/>(Presentation)"]
        
        subgraph "Application Layer"
            Service["UsersService<br/>(Orchestrator)"]
            UseCases["Use Cases<br/>CreateUserUseCase<br/>FindUserByIdUseCase<br/>UpdateUserUseCase"]
        end
        
        subgraph "Domain Layer"
            Repository["IUserRepository<br/>(Abstract)"]
        end
        
        subgraph "Infrastructure Layer"
            MongoRepo["UserMongoRepository<br/>(Implementation)"]
            Model["User Mongoose Model"]
        end
    end
    
    Controller --> Service
    Service --> UseCases
    UseCases --> Repository
    Repository -.->|implements| MongoRepo
    MongoRepo --> Model
```

## Other Modules: Flat Pattern

All other modules bypass domain/use-case layers:

```mermaid
graph TB
    subgraph "Posts Module (Flat)"
        Controller["PostsController"]
        Service["PostsService"]
        Model["Post Mongoose Model"]
    end
    
    Controller -->|Direct| Service
    Service -->|Direct| Model
    
    style Controller fill:#74b9ff
    style Service fill:#74b9ff
    style Model fill:#74b9ff
```

## Core Infrastructure Components

### Guards

Protects routes with authentication and authorization:

```mermaid
graph LR
    Request["Incoming Request"]
    
    subgraph "Guard Chain"
        AuthGuard["🔐 AuthGuard<br/>Verify JWT"]
        PermGuard["🛡️ PermissionsGuard<br/>Check Permissions"]
        WsAuthGuard["⚡ WsAuthGuard<br/>WebSocket Auth<br/>(unused)"]
    end
    
    Proceed["✅ Request Allowed"]
    Reject["❌ 401/403 Error"]
    
    Request --> AuthGuard
    AuthGuard -->|Valid| PermGuard
    AuthGuard -->|Invalid| Reject
    PermGuard -->|Allowed| Proceed
    PermGuard -->|Denied| Reject
```

### Response Transformation

```mermaid
graph TB
    Endpoint["Route Handler<br/>returns: { name, email }"]
    Interceptor["TransformInterceptor<br/>Wraps response"]
    
    Response["<br/>{\n  statusCode: 200,<br/>  data: { name, email },<br/>  timestamp: '2024-06-13...',<br/>  success: true<br/>}"]
    
    Endpoint --> Interceptor
    Interceptor --> Response
    
    style Response fill:#fdcb6e
```

### Exception Handling

```mermaid
graph TB
    Error["Exception Thrown<br/>in Route Handler"]
    Filter["GlobalExceptionFilter<br/>Catches all exceptions"]
    
    NotValidation["Non-validation Error"]
    ValidationError["ValidationError"]
    
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

## Data Layer

### Entity Relationships

```mermaid
erDiagram
    USER ||--o{ POST : "creates"
    USER ||--o{ COMMENT : "has"
    USER ||--|| ROLE : "assigned"
    POST ||--o{ COMMENT : "has"
    ROLE ||--o{ PERMISSION : "grants"
    
    USER {
        ObjectId id
        string username "unique"
        string email "unique"
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

## File Storage Architecture

```mermaid
graph TB
    Client["Frontend<br/>Upload File"]
    Controller["FilesController<br/>@Post('/upload')"]
    Service["FilesService"]
    MinIO["MinIO<br/>Object Storage"]
    FileRecord["File Metadata<br/>filename, url"]
    
    Client -->|multipart/form-data| Controller
    Controller -->|Validate| Service
    Service -->|Put object| MinIO
    Service -->|Save reference| FileRecord
    FileRecord -->|Return public URL| Client
    
    style MinIO fill:#ff9f43
    style FileRecord fill:#74b9ff
```

## Real-Time Communication (WebSocket)

```mermaid
graph TB
    Client1["Client 1"]
    Client2["Client 2"]
    
    subgraph "Socket.IO Server"
        Gateway["CommentsGateway<br/>/comments namespace"]
        Events["Event Handlers<br/>user:register<br/>comment:create<br/>comment:update<br/>comments:list"]
        Service["CommentsService"]
    end
    
    Database["MongoDB<br/>Comments Collection"]
    
    Client1 -->|emit event| Gateway
    Client2 -->|emit event| Gateway
    Gateway --> Events
    Events --> Service
    Service --> Database
    Service -->|broadcast| Gateway
    Gateway -->|emit event| Client1
    Gateway -->|emit event| Client2
    
    style Gateway fill:#00b894
    style Events fill:#00b894
```

## Performance Considerations

1. **Database Indexing**: Ensure indexes on frequently queried fields
   - `users.username` (unique)
   - `users.email` (unique)
   - `roles.identifier` (unique)
   - `posts.author` (foreign key)
   - `comments.postId` (foreign key)

2. **Pagination**: Use `PaginationService` (currently unused) for large datasets

3. **Caching**: Not implemented yet; consider Redis for session storage

4. **File Storage**: MinIO provides object storage with eventual consistency

## Security Layers

```mermaid
graph TB
    Request["Incoming Request"]
    HTTPS["HTTPS/TLS<br/>Transport Security"]
    CORS["CORS Validation<br/>Origin Check"]
    Auth["JWT Verification<br/>Signature + Expiry"]
    Perms["Permission Check<br/>RBAC"]
    Validation["Input Validation<br/>class-validator"]
    
    Request --> HTTPS
    HTTPS --> CORS
    CORS --> Auth
    Auth --> Perms
    Perms --> Validation
    Validation -->|✅ Allowed| Handler["Route Handler"]
    
    style HTTPS fill:#00b894
    style Auth fill:#0984e3
    style Perms fill:#6c5ce7
```

## Deployment Architecture

```mermaid
graph LR
    subgraph "Client"
        Browser["🌐 Browser<br/>Angular App"]
    end
    
    subgraph "Server"
        Node["🚀 NestJS<br/>Node.js"]
    end
    
    subgraph "Data"
        Mongo["🗄️ MongoDB"]
    end
    
    subgraph "Storage"
        Minio["☁️ MinIO"]
    end
    
    Browser -->|HTTP/WebSocket| Node
    Node -->|Query| Mongo
    Node -->|Object Store| Minio
```

---

**Next**: [Layers →](./layers.md)
