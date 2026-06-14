# Guía de Arquitectura Limpia - Backend NestJS

## 📐 Estructura por Módulo

```
src/app/modules/[module]/
├── domain/
│   ├── entities/          # Entidades de dominio (lógica pura)
│   └── value-objects/     # Value objects (datos inmutables)
├── application/
│   ├── use-cases/         # Casos de uso (lógica de negocio)
│   ├── dtos/              # Data Transfer Objects
│   └── services/          # Servicios de aplicación
├── infrastructure/
│   ├── repositories/      # Implementación de repositorios
│   ├── mappers/           # Mapeos (DTO ↔ Domain ↔ Persistence)
│   ├── controllers/       # Controladores HTTP
│   └── gateways/          # WebSocket gateways
├── constants/             # Constantes del módulo
├── interfaces/            # Contratos públicos
├── schemas/               # Schemas de MongoDB
├── pipes/                 # Pipes personalizados
├── filters/               # Filtros de excepciones
└── [module].module.ts     # Módulo NestJS
```

---

## 🎯 Principios SOLID Aplicados

### S - Single Responsibility Principle
Cada clase tiene una única razón para cambiar.

```typescript
// ✅ CORRECTO: Responsabilidad única
export class CreatePostUseCase {
  constructor(private postRepository: PostRepository) {}
  
  async execute(data: CreatePostDto): Promise<Post> {
    // Solo crea posts, nada más
  }
}

// ❌ INCORRECTO: Múltiples responsabilidades
export class PostService {
  async create() { /* ... */ }
  async update() { /* ... */ }
  async validatePermissions() { /* ... */ }
  async sendEmail() { /* ... */ }
  async logActivity() { /* ... */ }
}
```

### O - Open/Closed Principle
Abierto para extensión, cerrado para modificación.

```typescript
// ✅ CORRECTO: Interfaz extensible
export interface IRepository<T> {
  create(item: T): Promise<T>;
  findById(id: string): Promise<T | null>;
}

// Extensión sin modificar clase base
export class PostRepository implements IRepository<Post> {
  async create(post: Post): Promise<Post> { /* ... */ }
  async findById(id: string): Promise<Post | null> { /* ... */ }
}
```

### L - Liskov Substitution Principle
Las subclases deben ser intercambiables por sus clases base.

```typescript
// ✅ CORRECTO: Implementaciones intercambiables
const repository: IPostRepository = isTest 
  ? new MockPostRepository()
  : new PostgresPostRepository();
```

### I - Interface Segregation Principle
Clientes no deben depender de interfaces que no usan.

```typescript
// ✅ CORRECTO: Interfaces pequeñas y específicas
export interface ICreatePostUseCase {
  execute(data: CreatePostDto): Promise<Post>;
}

export interface IDeletePostUseCase {
  execute(id: string): Promise<void>;
}

// ❌ INCORRECTO: Interfaz gorda
export interface IPostService {
  create() { /* ... */ }
  read() { /* ... */ }
  update() { /* ... */ }
  delete() { /* ... */ }
  validate() { /* ... */ }
  log() { /* ... */ }
}
```

### D - Dependency Inversion Principle
Depender de abstracciones, no de implementaciones concretas.

```typescript
// ✅ CORRECTO: Depende de interfaz
export class PostController {
  constructor(private createPostUseCase: CreatePostUseCase) {}
}

// ❌ INCORRECTO: Depende de implementación concreta
export class PostController {
  private createPostUseCase = new CreatePostUseCase();
}
```

---

## 🏗️ Flujo de Datos

```
HTTP Request
    ↓
Controller (recibe request)
    ↓
DTO Validation (dto-validator.pipe)
    ↓
Use Case (lógica de negocio)
    ↓
Domain Entity (validaciones de dominio)
    ↓
Repository (acceso a datos)
    ↓
Mapper (DTO → Persistence → Domain)
    ↓
MongoDB
    ↓
Mapper (Persistence → Domain → DTO)
    ↓
Response (JSON)
```

---

## 📋 Ejemplo Completo: Module Post

### 1. Constant

```typescript
// src/app/modules/posts/constants/post.constants.ts
export const POST_VALIDATION = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 200,
  BODY_MIN_LENGTH: 10,
  BODY_MAX_LENGTH: 50000,
  AUTHOR_MIN_LENGTH: 2,
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
};
```

### 2. Interface

```typescript
// src/app/modules/posts/interfaces/post.interface.ts
export interface IPost {
  _id?: string;
  title: string;
  body: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostRepository {
  create(post: IPost): Promise<IPost>;
  findById(id: string): Promise<IPost | null>;
  findAll(skip: number, limit: number): Promise<{ items: IPost[]; total: number }>;
}
```

### 3. Domain Entity

```typescript
// src/app/modules/posts/domain/entities/post.entity.ts
export class PostEntity {
  readonly _id?: string;
  readonly title: string;
  readonly body: string;
  readonly author: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: IPost) {
    this.validateTitle(props.title);
    this.validateBody(props.body);
    
    this._id = props._id;
    this.title = props.title;
    this.body = props.body;
    this.author = props.author;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  private validateTitle(title: string): void {
    if (title.length < POST_VALIDATION.TITLE_MIN_LENGTH) {
      throw new DomainException('Título muy corto');
    }
  }

  private validateBody(body: string): void {
    if (body.length < POST_VALIDATION.BODY_MIN_LENGTH) {
      throw new DomainException('Body muy corto');
    }
  }

  update(props: Partial<IPost>): PostEntity {
    return new PostEntity({
      ...this,
      ...props,
      updatedAt: new Date(),
    });
  }
}
```

### 4. Use Case

```typescript
// src/app/modules/posts/application/use-cases/create-post.use-case.ts
@Injectable()
export class CreatePostUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(createPostDto: CreatePostDto): Promise<PostEntity> {
    // Crear entidad de dominio (valida en constructor)
    const post = new PostEntity({
      title: createPostDto.title,
      body: createPostDto.body,
      author: createPostDto.author,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Persistir
    return this.postRepository.create(post);
  }
}
```

### 5. Mapper

```typescript
// src/app/modules/posts/infrastructure/mappers/post.mapper.ts
@Injectable()
export class PostMapper {
  toDomain(raw: any): PostEntity {
    return new PostEntity(raw);
  }

  toResponse(entity: PostEntity): PostResponseDto {
    return {
      id: entity._id,
      title: entity.title,
      body: entity.body,
      author: entity.author,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  toPersistence(entity: PostEntity): any {
    return {
      title: entity.title,
      body: entity.body,
      author: entity.author,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
```

### 6. Repository

```typescript
// src/app/modules/posts/infrastructure/repositories/post.repository.ts
@Injectable()
export class PostRepository implements IPostRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private postMapper: PostMapper,
  ) {}

  async create(post: PostEntity): Promise<PostEntity> {
    const created = await this.postModel.create(
      this.postMapper.toPersistence(post)
    );
    return this.postMapper.toDomain(created);
  }

  async findById(id: string): Promise<PostEntity | null> {
    const post = await this.postModel.findById(id).exec();
    return post ? this.postMapper.toDomain(post) : null;
  }

  async findAll(
    skip: number,
    limit: number,
  ): Promise<{ items: PostEntity[]; total: number }> {
    const [items, total] = await Promise.all([
      this.postModel.find().skip(skip).limit(limit).exec(),
      this.postModel.countDocuments().exec(),
    ]);

    return {
      items: items.map(item => this.postMapper.toDomain(item)),
      total,
    };
  }
}
```

### 7. Controller

```typescript
// src/app/modules/posts/infrastructure/controllers/posts.controller.ts
@Controller('posts')
export class PostsController {
  constructor(
    private createPostUseCase: CreatePostUseCase,
    private getPostsUseCase: GetPostsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreatePostDto) {
    const post = await this.createPostUseCase.execute(createPostDto);
    return ApiResponse.success(post, POST_MESSAGES.CREATED);
  }

  @Get()
  async findAll(@Query() query: PaginationDto) {
    const result = await this.getPostsUseCase.execute(
      query.skip,
      query.limit
    );
    return ApiResponse.success(result);
  }
}
```

### 8. Module

```typescript
// src/app/modules/posts/posts.module.ts
@Module({
  imports: [MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }])],
  controllers: [PostsController],
  providers: [
    // Use Cases
    CreatePostUseCase,
    GetPostsUseCase,
    UpdatePostUseCase,
    DeletePostUseCase,
    
    // Repository & Mapper
    PostRepository,
    PostMapper,
  ],
  exports: [PostRepository],
})
export class PostsModule {}
```

---

## 🧪 Testing Architecture

```typescript
// test/modules/posts/create-post.use-case.spec.ts
describe('CreatePostUseCase', () => {
  let useCase: CreatePostUseCase;
  let mockRepository: Partial<PostRepository>;

  beforeEach(() => {
    // Mock
    mockRepository = {
      create: jest.fn().mockResolvedValue({
        _id: '1',
        title: 'Test',
        body: 'Test body',
        author: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };

    // Setup
    useCase = new CreatePostUseCase(mockRepository as PostRepository);
  });

  it('should create a post successfully', async () => {
    const dto = new CreatePostDto();
    dto.title = 'Test';
    dto.body = 'Test body';
    dto.author = 'Test';

    const result = await useCase.execute(dto);

    expect(result).toBeDefined();
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it('should throw error for invalid title', async () => {
    const dto = new CreatePostDto();
    dto.title = 'A'; // Too short
    dto.body = 'Test body';
    dto.author = 'Test';

    await expect(useCase.execute(dto)).rejects.toThrow();
  });
});
```

---

## 🎨 Mejores Prácticas

### 1. **Usar constantes en lugar de magic strings**

```typescript
// ❌ MAL
if (action === 'CREATE') { /* ... */ }

// ✅ BIEN
if (action === AuditAction.CREATE) { /* ... */ }
```

### 2. **Traducciones centralizadas**

```typescript
// src/core/constants/i18n.constants.ts
export const I18N_MESSAGES = {
  ES: {
    POST: {
      CREATED: 'Post creado exitosamente',
      UPDATED: 'Post actualizado exitosamente',
    },
  },
};

// Uso
return ApiResponse.success(post, I18N_MESSAGES.ES.POST.CREATED);
```

### 3. **DTOs separados por responsabilidad**

```typescript
// ✅ CORRECTO
export class CreatePostDto { /* ... */ }
export class UpdatePostDto { /* ... */ }
export class PostResponseDto { /* ... */ }

// ❌ INCORRECTO
export class PostDto { /* para create, update, response */ }
```

### 4. **Funciones pequeñas y enfocadas**

```typescript
// ❌ MAL: Función larga con múltiples responsabilidades
async getPostsWithFilters(...) {
  // validar
  // filtrar
  // paginar
  // contar
  // mapear
  // loguear
  // enviar email
}

// ✅ BIEN: Funciones pequeñas
private validateFilters() { /* ... */ }
private applyFilters() { /* ... */ }
private buildResponse() { /* ... */ }
```

### 5. **Inyección de dependencias**

```typescript
// ✅ CORRECTO
@Injectable()
export class PostService {
  constructor(
    private postRepository: PostRepository,
    private auditService: AuditService,
  ) {}
}

// ❌ INCORRECTO
export class PostService {
  private postRepository = new PostRepository();
  private auditService = new AuditService();
}
```

---

## 📦 Estructura de Carpetas Recomendada

```
backend-post-message-nestjs/
├── src/
│   ├── app/
│   │   ├── modules/
│   │   │   ├── audit/
│   │   │   │   ├── domain/
│   │   │   │   ├── application/
│   │   │   │   ├── infrastructure/
│   │   │   │   ├── constants/
│   │   │   │   ├── interfaces/
│   │   │   │   └── audit.module.ts
│   │   │   ├── posts/
│   │   │   ├── comments/
│   │   │   └── ...
│   │   ├── core/
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── pipes/
│   │   │   ├── constants/
│   │   │   ├── dto/
│   │   │   ├── exceptions/
│   │   │   ├── middleware/
│   │   │   ├── utils/
│   │   │   └── services/
│   │   └── app.module.ts
│   ├── main.ts
│   └── ...
├── test/
│   ├── modules/
│   │   ├── audit/
│   │   ├── posts/
│   │   └── ...
│   └── ...
├── docker-compose.yml
├── package.json
└── ...
```

---

## ✅ Checklist de Refactorización

- [ ] Crear estructura domain/application/infrastructure
- [ ] Mover lógica a entities (validaciones de dominio)
- [ ] Crear use cases para operaciones principales
- [ ] Implementar repositories como interfaces
- [ ] Crear mappers para conversiones
- [ ] Centralizar constantes y mensajes
- [ ] Implementar tests unitarios
- [ ] Usar traducciones en mensajes
- [ ] Documentar en Swagger con constantes
- [ ] Inyectar todas las dependencias
- [ ] Separar DTOs por responsabilidad
- [ ] Mantener funciones pequeñas (<30 líneas)

---

## 🔗 Referencias

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://www.baeldung.com/solid-principles)
- [Domain-Driven Design](https://www.domainlanguage.com/ddd/)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
