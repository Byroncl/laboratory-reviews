---
sidebar_position: 3
title: Module Structure
description: How modules are organized in NestJS
---

# Module Structure

## Module Architecture Pattern

Each NestJS module encapsulates a feature and declares its dependencies explicitly.

```mermaid
graph TB
    subgraph "Module<br/>Feature"
        Controllers["Controllers"]
        Services["Services"]
        Models["Schemas"]
        Exports["Exported Services"]
    end
    
    subgraph "Dependencies"
        Imports["Imported Modules"]
    end
    
    Controllers -->|uses| Services
    Services -->|uses| Models
    Models -->|database| MongoDB["MongoDB"]
    
    Imports -->|imported by| Services
    Exports -->|exported for| OtherModules["Other Modules"]
```

## Module Dependency Graph

```mermaid
graph TB
    AppModule["📦 AppModule<br/>(Root)"]
    
    ConfigModule["⚙️ ConfigModule<br/>Global"]
    MongooseModule["🗄️ MongooseModule<br/>Global"]
    
    AuthModule["🔐 AuthModule"]
    UsersModule["👥 UsersModule"]
    PostsModule["📝 PostsModule"]
    CommentsModule["💬 CommentsModule"]
    ClientsModule["👤 ClientsModule"]
    FilesModule["📁 FilesModule"]
    RolesModule["🎭 RolesModule<br/>ORPHANED"]
    PermissionsModule["🔑 PermissionsModule<br/>ORPHANED"]
    I18nModule["🌍 I18nModule"]
    
    PassportModule["🔑 PassportModule"]
    JwtModule["🔐 JwtModule"]
    
    AppModule --> ConfigModule
    AppModule --> MongooseModule
    AppModule --> AuthModule
    AppModule --> UsersModule
    AppModule --> PostsModule
    AppModule --> CommentsModule
    AppModule --> ClientsModule
    AppModule --> FilesModule
    AppModule --> I18nModule
    
    AuthModule --> PassportModule
    AuthModule --> JwtModule
    AuthModule -->|imports| UsersModule
    AuthModule -->|exports| JwtModule
    
    CommentsModule -->|imports| PostsModule
    
    RolesModule -.->|NOT imported| AppModule
    PermissionsModule -.->|NOT imported| AppModule
    
    style AppModule fill:#ff6b6b
    style AuthModule fill:#4ecdc4
    style UsersModule fill:#45b7d1
    style PostsModule fill:#96ceb4
    style CommentsModule fill:#ffeaa7
    style ClientsModule fill:#dfe6e9
    style FilesModule fill:#a29bfe
    style I18nModule fill:#74b9ff
    style RolesModule fill:#fab1a0
    style PermissionsModule fill:#fab1a0
```

## Core Module Structure

```
src/app/
├── core/                          # Infrastructure & cross-cutting
│   ├── decorators/
│   │   ├── auth.decorator.ts     # @Auth() — marks protected routes
│   │   ├── current-user.decorator.ts  # @CurrentUser() — extracts user
│   │   ├── has-permission.decorator.ts # @HasPermission() — permission metadata
│   │   └── is-strong-password.decorator.ts
│   │
│   ├── filters/
│   │   └── global-exception.filter.ts # Exception handler
│   │
│   ├── guards/
│   │   ├── auth.guard.ts         # JWT verification + @Auth() reflection
│   │   ├── permissions.guard.ts  # RBAC enforcement
│   │   ├── jwt-auth.guard.ts     # Legacy Passport-based (coexists)
│   │   └── ws-auth.guard.ts      # WebSocket JWT (unused)
│   │
│   ├── interceptors/
│   │   └── transform.interceptor.ts # Response envelope wrapping
│   │
│   ├── middleware/
│   │   └── i18n.middleware.ts    # Language detection
│   │
│   ├── i18n/
│   │   ├── i18n.service.ts       # Request-scoped i18n
│   │   └── locales/
│   │       ├── en.json           # English translations
│   │       └── es.json           # Spanish translations
│   │
│   ├── services/
│   │   ├── pagination.service.ts # Generic pagination (unused)
│   │   └── query.service.ts      # Query builder (unused)
│   │
│   ├── utils/
│   │   ├── crypto.utils.ts
│   │   ├── file.utils.ts
│   │   ├── string.utils.ts
│   │   ├── array.utils.ts
│   │   ├── date.utils.ts
│   │   ├── validation.utils.ts
│   │   └── translation.service.ts # Stateful singleton i18n
│   │
│   ├── constants/
│   │   └── constants.ts
│   │
│   ├── plugins/
│   │   └── mongoose-audit.plugin.ts # Audit timestamps (unused)
│   │
│   └── types/
│       └── current-user.payload.ts
```

## Feature Module Structure

### Standard Module Layout

```
src/app/modules/[feature]/
├── controllers/
│   └── [feature].controller.ts
├── services/
│   └── [feature].service.ts
├── schemas/
│   └── [feature].schema.ts
├── dtos/
│   ├── create-[feature].dto.ts
│   └── update-[feature].dto.ts
├── [feature].module.ts
└── types/ (optional)
    └── [feature]-types.ts
```

### Users Module (Clean Architecture)

```
src/app/modules/users/
├── controllers/
│   └── users.controller.ts
├── services/
│   └── users.service.ts          # Orchestrator service
├── use-cases/
│   ├── create-user.use-case.ts
│   ├── find-all-users.use-case.ts
│   ├── find-user-by-id.use-case.ts
│   ├── find-user-by-username.use-case.ts
│   ├── update-user.use-case.ts
│   ├── remove-user.use-case.ts
│   └── update-language-preference.use-case.ts
├── repositories/
│   ├── user.repository.ts        # Abstract interface
│   └── user.mongo.repository.ts  # Mongoose implementation
├── schemas/
│   └── user.schema.ts
├── dtos/
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
├── types/
│   └── user-types.ts
└── users.module.ts
```

### Posts Module (Flat)

```
src/app/modules/posts/
├── controllers/
│   └── posts.controller.ts
├── services/
│   └── posts.service.ts
├── schemas/
│   └── post.schema.ts
├── dtos/
│   ├── create-post.dto.ts
│   └── update-post.dto.ts
└── posts.module.ts
```

### Comments Module (Flat + WebSocket)

```
src/app/modules/comments/
├── controllers/
│   └── comments.controller.ts
├── gateways/
│   └── comments.gateway.ts       # Socket.IO gateway
├── services/
│   └── comments.service.ts
├── schemas/
│   └── comment.schema.ts
├── dtos/
│   ├── create-comment.dto.ts
│   └── update-comment.dto.ts
├── types/
│   └── socket-events.ts
└── comments.module.ts
```

## Module Declaration

```typescript
@Module({
  imports: [
    // External modules this module depends on
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    JwtModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    CreateUserUseCase,
    {
      provide: 'IUserRepository',
      useClass: UserMongoRepository,
    },
  ],
  exports: [UsersService],  // Exported for other modules
})
export class UsersModule {}
```

## Dependency Injection Container

```mermaid
graph TB
    Provider1["Provider<br/>UseClass: UserMongoRepository<br/>Token: IUserRepository"]
    Provider2["Provider<br/>UseClass: UsersService<br/>Token: UsersService"]
    Provider3["Provider<br/>UseClass: CreateUserUseCase<br/>Token: CreateUserUseCase"]
    
    Service["UsersService<br/>Needs: IUserRepository"]
    UseCase["CreateUserUseCase<br/>Needs: IUserRepository"]
    
    DIContainer["Dependency Injection<br/>Container"]
    
    Provider1 -->|registered in| DIContainer
    Provider2 -->|registered in| DIContainer
    Provider3 -->|registered in| DIContainer
    
    DIContainer -->|injects| Service
    DIContainer -->|injects| UseCase
    
    Service -->|depends on| Provider1
    UseCase -->|depends on| Provider1
```

## Module Exports & Imports

```typescript
// Module A: Exports a service
@Module({
  providers: [ServiceA],
  exports: [ServiceA],  // <-- exported
})
export class ModuleA {}

// Module B: Imports and uses ServiceA
@Module({
  imports: [ModuleA],  // <-- imports ModuleA
  providers: [ServiceB],  // ServiceB can now depend on ServiceA
})
export class ModuleB {}

// In ServiceB:
export class ServiceB {
  constructor(
    private serviceA: ServiceA,  // <-- available because ModuleA exported it
  ) {}
}
```

## Common Module Files

### DTO (Data Transfer Object)

Validates incoming request data:

```typescript
export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsEnum(UserType)
  type: UserType;
}
```

**Files**: `src/app/modules/*/dtos/`

### Schema (MongoDB)

Defines the structure of documents:

```typescript
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password_hash: string;

  @Prop({ enum: UserType, default: UserType.USER })
  type: UserType;

  @Prop({ type: Schema.Types.ObjectId, ref: 'Role' })
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

**Files**: `src/app/modules/*/schemas/`

### Types

TypeScript interfaces and types:

```typescript
export type CurrentUserPayload = {
  userId: string;
  type: UserType;
  role: {
    id: string;
    permissions: Permission[];
  };
};

export enum UserType {
  USER = 'user',
  ADMIN = 'admin',
  CLIENT = 'client',
}
```

**Files**: `src/app/modules/*/types/`

## Module Initialization

When the application starts:

```mermaid
sequenceDiagram
    participant Main as main.ts
    participant AppModule as AppModule
    participant DI as Dependency Injector
    participant Modules as Feature Modules
    participant Services as Services
    
    Main->>AppModule: bootstrap()
    AppModule->>AppModule: Declare imports, providers
    AppModule->>DI: Register providers
    DI->>Modules: Instantiate modules
    Modules->>DI: Register module providers
    DI->>Services: Instantiate services
    Services->>DI: Resolve dependencies
    DI->>Services: Inject dependencies
    Services->>Main: Services ready
    Main->>Main: Start HTTP listener
```

---

**Next**: [Auth Module →](../modules/auth.md)
