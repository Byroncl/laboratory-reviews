# Checklist de Refactorización - Backend Clean Architecture

## 📊 Estado Actual

| Módulo | Domain | Use Cases | Repository | Mapper | Constants | Interfaces | Tests | Status |
|--------|--------|-----------|------------|--------|-----------|-----------|-------|--------|
| **audit** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟢 DONE |
| **posts** | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | 🟡 TODO |
| **comments** | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | 🟡 TODO |
| **clients** | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | 🟡 TODO |
| **favorites** | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | 🟡 TODO |

---

## 🔧 Guía por Módulo: Posts

### Paso 1: Crear Estructura de Directorios

```bash
mkdir -p backend-post-message-nestjs/src/app/modules/posts/{
  domain/entities,
  domain/value-objects,
  application/use-cases,
  application/dtos,
  infrastructure/repositories,
  infrastructure/mappers,
  constants,
  interfaces
}
```

### Paso 2: Posts Constants

```typescript
// src/app/modules/posts/constants/post.constants.ts
export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export const POST_VALIDATION = {
  TITLE_MIN: 3,
  TITLE_MAX: 200,
  BODY_MIN: 10,
  BODY_MAX: 50000,
};

export const POST_MESSAGES = {
  CREATED: 'Post creado exitosamente',
  UPDATED: 'Post actualizado exitosamente',
  DELETED: 'Post eliminado exitosamente',
  NOT_FOUND: 'Post no encontrado',
};

export const POST_SWAGGER = {
  GET_ALL: {
    SUMMARY: 'Obtener todos los posts',
    DESCRIPTION: 'Retorna una lista paginada de posts',
  },
  CREATE: {
    SUMMARY: 'Crear un nuevo post',
    DESCRIPTION: 'Crea un nuevo post con los datos proporcionados',
  },
};
```

### Paso 3: Posts Interface

```typescript
// src/app/modules/posts/interfaces/post.interface.ts
export interface IPost {
  _id?: string;
  title: string;
  body: string;
  author: string;
  authorId?: string;
  categoryId?: string;
  imageUrl?: string;
  status?: PostStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostRepository {
  create(post: IPost): Promise<IPost>;
  findById(id: string): Promise<IPost | null>;
  findByAuthorId(authorId: string, skip: number, limit: number): Promise<{ items: IPost[]; total: number }>;
  findAll(skip: number, limit: number, filters?: any): Promise<{ items: IPost[]; total: number }>;
  update(id: string, post: Partial<IPost>): Promise<IPost | null>;
  delete(id: string): Promise<void>;
}
```

### Paso 4: Posts Entity

```typescript
// src/app/modules/posts/domain/entities/post.entity.ts
export class PostEntity {
  readonly _id?: string;
  readonly title: string;
  readonly body: string;
  readonly author: string;
  readonly authorId?: string;
  readonly categoryId?: string;
  readonly imageUrl?: string;
  readonly status: PostStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: IPost) {
    this.validateTitle(props.title);
    this.validateBody(props.body);
    this.validateAuthor(props.author);

    this._id = props._id;
    this.title = props.title;
    this.body = props.body;
    this.author = props.author;
    this.authorId = props.authorId;
    this.categoryId = props.categoryId;
    this.imageUrl = props.imageUrl;
    this.status = props.status || PostStatus.PUBLISHED;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  private validateTitle(title: string): void {
    if (title.length < POST_VALIDATION.TITLE_MIN) {
      throw new DomainException('Título muy corto');
    }
    if (title.length > POST_VALIDATION.TITLE_MAX) {
      throw new DomainException('Título muy largo');
    }
  }

  private validateBody(body: string): void {
    if (body.length < POST_VALIDATION.BODY_MIN) {
      throw new DomainException('Body muy corto');
    }
    if (body.length > POST_VALIDATION.BODY_MAX) {
      throw new DomainException('Body muy largo');
    }
  }

  private validateAuthor(author: string): void {
    if (!author || author.trim().length === 0) {
      throw new DomainException('Autor es requerido');
    }
  }

  update(props: Partial<IPost>): PostEntity {
    return new PostEntity({
      _id: this._id,
      title: props.title ?? this.title,
      body: props.body ?? this.body,
      author: props.author ?? this.author,
      authorId: props.authorId ?? this.authorId,
      categoryId: props.categoryId ?? this.categoryId,
      imageUrl: props.imageUrl ?? this.imageUrl,
      status: props.status ?? this.status,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  archive(): PostEntity {
    return this.update({ status: PostStatus.ARCHIVED });
  }

  publish(): PostEntity {
    return this.update({ status: PostStatus.PUBLISHED });
  }

  isDraft(): boolean {
    return this.status === PostStatus.DRAFT;
  }

  isPublished(): boolean {
    return this.status === PostStatus.PUBLISHED;
  }

  isArchived(): boolean {
    return this.status === PostStatus.ARCHIVED;
  }
}
```

### Paso 5: Posts Mapper

Sigue el patrón de AuditLogMapper:
- `toDomain()` - Raw → Entity
- `toResponse()` - Entity → DTO
- `toPersistence()` - Entity → MongoDB

### Paso 6: Posts Repository

Implementa `IPostRepository` con los métodos CRUD.

### Paso 7: Posts Use Cases

Crea use cases separados:
- `CreatePostUseCase`
- `GetPostsUseCase`
- `GetPostByIdUseCase`
- `UpdatePostUseCase`
- `DeletePostUseCase`
- `GetMyPostsUseCase`

### Paso 8: Posts Tests

Crea tests para:
- `PostEntity` (validaciones de dominio)
- `PostRepository` (CRUD operations)
- `CreatePostUseCase` (lógica de negocio)

---

## 🔧 Guía por Módulo: Comments

### Pasos Similares a Posts

1. **Constants**: `COMMENT_VALIDATION`, `COMMENT_MESSAGES`
2. **Interface**: `IComment`, `ICommentRepository`
3. **Entity**: `CommentEntity` con validaciones
4. **Mapper**: `CommentMapper`
5. **Repository**: Implementar `ICommentRepository`
6. **Use Cases**: CRUD + `GetCommentsByPostIdUseCase`
7. **Tests**: Entity, Repository, Use Cases

### Validaciones Específicas de Comments

```typescript
// Título: min 1, max 500 caracteres
// Body: min 1, max 2000 caracteres
// Email: debe ser válido
// PostId: debe ser ObjectId válido
```

---

## 🔧 Guía por Módulo: Clients

### Particularidades

- Incluir validaciones de contraseña (fuerza)
- Separar en DTOs: `CreateClientDto`, `UpdateClientDto`, `ClientResponseDto`
- Use cases: CRUD + profile management
- Tests para validación de contraseña

---

## 🔧 Guía por Módulo: Favorites

### Particularidades

- Modelo simple: `clientId + postId`
- Validar que post existe antes de crear favorito
- Use cases: Add, Remove, GetMyFavorites
- Repository con índice único `(clientId, postId)`

---

## 📝 Checklist de Refactorización por Módulo

Para cada módulo, sigue este checklist:

### Domain Layer
- [ ] Crear entidad con validaciones en constructor
- [ ] Implementar métodos de negocio en la entidad
- [ ] Usar value objects para datos complejos
- [ ] Hacer propiedades readonly (inmutabilidad)

### Application Layer
- [ ] Crear interfaces para DTOs
- [ ] Separar DTOs por responsabilidad (Create, Update, Response)
- [ ] Documentar DTOs con @ApiProperty()
- [ ] Crear use cases para operaciones principales
- [ ] Cada use case con single responsibility

### Infrastructure Layer
- [ ] Crear repository que implementa interfaz
- [ ] Implementar mapper (toDomain, toResponse, toPersistence)
- [ ] Inyectar dependencias en constructor
- [ ] Actualizar controlador para usar use cases
- [ ] Actualizar módulo para exportar providers

### Constants & Interfaces
- [ ] Crear constants.ts con validaciones
- [ ] Crear constants.ts con mensajes
- [ ] Crear constants.ts con Swagger docs
- [ ] Crear interfaces.ts con contratos públicos
- [ ] Usar constantes en lugar de magic strings

### Testing
- [ ] Tests para entidad (validaciones)
- [ ] Tests para repository (CRUD)
- [ ] Tests para use cases (lógica)
- [ ] Mínimo 80% cobertura

---

## ✨ Beneficios de la Refactorización

### Antes (Legacy)
```typescript
// Service gigante con todo mezclado
export class PostService {
  async create(dto) { /* 50 líneas */ }
  async update(dto) { /* 50 líneas */ }
  async delete(id) { /* 30 líneas */ }
  async validate() { /* 20 líneas */ }
  async log() { /* 15 líneas */ }
  async cache() { /* 20 líneas */ }
  // ... más de 200 líneas en 1 archivo
}
```

### Después (Clean Architecture)
```typescript
// Cada cosa en su lugar
PostEntity              // Validaciones de dominio
CreatePostUseCase       // Lógica de creación
PostRepository          // Acceso a datos
PostMapper              // Transformaciones
POST_VALIDATION         // Constantes
IPostRepository         // Interfaz pública
```

### Resultados
✅ Código más testeable
✅ Responsabilidades claras
✅ Fácil de mantener
✅ Fácil de extender
✅ Reutilizable
✅ Desacoplado

---

## 🚀 Order de Refactorización Recomendado

1. **Audit** (✅ DONE) - Template/referencia
2. **Posts** - Más importante, muchas operaciones
3. **Comments** - Relacionado con posts
4. **Clients** - CRUD + perfil
5. **Favorites** - Más simple, último

---

## 📚 Documentos Relacionados

- `CLEAN-ARCHITECTURE-GUIDE.md` - Guía completa de principios SOLID
- `PERMISSIONS-GUIDE.md` - Sistema de permisos y roles
- Backend tests: `/test/modules/[module]/*.spec.ts`

---

## 🧪 Comando para Ejecutar Tests

```bash
# Tests de un módulo específico
npm test -- test/modules/audit

# Tests con cobertura
npm test -- --coverage

# Watch mode (durante desarrollo)
npm test -- --watch
```

---

## 📊 Métricas a Alcanzar

| Métrica | Target | Current |
|---------|--------|---------|
| Code Coverage | >80% | ⏳ |
| Functions/Class | <20 | ⏳ |
| Lines/Function | <30 | ⏳ |
| Cyclomatic Complexity | <5 | ⏳ |
| Testability | 100% | ⏳ |

---

## 🎯 Próximos Pasos

1. Usar este checklist para refactorizar **Posts**
2. Una vez Posts esté refactorizado, aplicar patrón a otros módulos
3. Actualizar módulo.ts para usar nuevos providers
4. Actualizar controladores para inyectar use cases
5. Escribir tests para cada módulo
6. Actualizar Swagger docs con constantes

**Nota**: La arquitectura debe ser consistente en todos los módulos para mantener la cohesión del proyecto.
