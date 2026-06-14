---
sidebar_position: 2
title: Users Module
description: User management with Clean Architecture
---

# Users Module 👥

The Users module manages user accounts with full **Clean Architecture** implementation.

## Overview

This is the **only module** in the codebase that implements the complete domain-driven design pattern with use cases and repositories.

```mermaid
graph TB
    Controller["UsersController"]
    Service["UsersService<br/>(Orchestrator)"]
    
    subgraph "Use Cases"
        CreateUC["CreateUserUseCase"]
        FindAllUC["FindAllUsersUseCase"]
        FindByIdUC["FindUserByIdUseCase"]
        FindByUsernameUC["FindUserByUsernameUseCase"]
        UpdateUC["UpdateUserUseCase"]
        RemoveUC["RemoveUserUseCase"]
        UpdateLangUC["UpdateLanguagePreferenceUseCase"]
    end
    
    subgraph "Repository Pattern"
        IRepository["IUserRepository<br/>(Abstract)"]
        MongoRepo["UserMongoRepository<br/>(Implementation)"]
    end
    
    Model["User Mongoose Model"]
    
    Controller --> Service
    Service --> CreateUC
    Service --> FindAllUC
    Service --> FindByIdUC
    Service --> FindByUsernameUC
    Service --> UpdateUC
    Service --> RemoveUC
    Service --> UpdateLangUC
    
    CreateUC --> IRepository
    FindAllUC --> IRepository
    FindByIdUC --> IRepository
    FindByUsernameUC --> IRepository
    UpdateUC --> IRepository
    RemoveUC --> IRepository
    UpdateLangUC --> IRepository
    
    IRepository -.->|implements| MongoRepo
    MongoRepo --> Model
```

## Module Structure

```
src/app/modules/users/
├── controllers/
│   └── users.controller.ts
├── services/
│   └── users.service.ts              # Orchestrator
├── use-cases/
│   ├── create-user.use-case.ts
│   ├── find-all-users.use-case.ts
│   ├── find-user-by-id.use-case.ts
│   ├── find-user-by-username.use-case.ts
│   ├── update-user.use-case.ts
│   ├── remove-user.use-case.ts
│   └── update-language-preference.use-case.ts
├── repositories/
│   ├── user.repository.ts            # Abstract interface
│   └── user.mongo.repository.ts      # MongoDB implementation
├── schemas/
│   └── user.schema.ts
├── dtos/
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
├── types/
│   └── user-types.ts
└── users.module.ts
```

## User Schema

```typescript
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password_hash: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  lastname: string;

  @Prop({ enum: UserType, default: UserType.USER })
  type: UserType;

  @Prop({ type: Schema.Types.ObjectId, ref: 'Role' })
  role: Role;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ enum: ['en', 'es'], default: 'en' })
  preferredLanguage: string;

  createdAt?: Date;
  updatedAt?: Date;
}
```

**Location**: `src/app/modules/users/schemas/user.schema.ts`

## Services

### UsersService (Orchestrator)

```typescript
@Injectable()
export class UsersService {
  constructor(
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    private createUserUseCase: CreateUserUseCase,
    private findAllUsersUseCase: FindAllUsersUseCase,
    private findUserByIdUseCase: FindUserByIdUseCase,
    private findUserByUsernameUseCase: FindUserByUsernameUseCase,
    private updateUserUseCase: UpdateUserUseCase,
    private removeUserUseCase: RemoveUserUseCase,
    private updateLanguagePreferenceUseCase: UpdateLanguagePreferenceUseCase,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    return this.createUserUseCase.execute(createUserDto);
  }

  async findAll() {
    return this.findAllUsersUseCase.execute();
  }

  async findUserById(id: string) {
    return this.findUserByIdUseCase.execute(id);
  }

  async findUserByUsername(username: string) {
    return this.findUserByUsernameUseCase.execute(username);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    return this.updateUserUseCase.execute(id, updateUserDto);
  }

  async removeUser(id: string) {
    return this.removeUserUseCase.execute(id);
  }

  async updateLanguagePreference(id: string, language: string) {
    return this.updateLanguagePreferenceUseCase.execute(id, language);
  }
}
```

**Location**: `src/app/modules/users/services/users.service.ts`

## Use Cases

Each use case handles a specific business operation:

### CreateUserUseCase

```typescript
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    private cryptoUtils: CryptoUtils,
  ) {}

  async execute(createUserDto: CreateUserDto) {
    // Check if username already exists
    const existingUser = await this.userRepository.findByUsername(
      createUserDto.username,
    );
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    const hashedPassword = await this.cryptoUtils.hashPassword(
      createUserDto.password,
    );

    // Create user
    return this.userRepository.create({
      ...createUserDto,
      password_hash: hashedPassword,
    });
  }
}
```

**Location**: `src/app/modules/users/use-cases/create-user.use-case.ts`

### FindUserByIdUseCase

```typescript
@Injectable()
export class FindUserByIdUseCase {
  constructor(
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
  ) {}

  async execute(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
```

### Other Use Cases

- `FindAllUsersUseCase` — Retrieve all users
- `FindUserByUsernameUseCase` — Find user by username
- `UpdateUserUseCase` — Update user data
- `RemoveUserUseCase` — Soft delete user
- `UpdateLanguagePreferenceUseCase` — Update preferred language

**Location**: `src/app/modules/users/use-cases/`

## Repositories

### IUserRepository (Abstract)

```typescript
export interface IUserRepository {
  create(user: CreateUserDto): Promise<User>;
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  update(id: string, user: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}
```

**Location**: `src/app/modules/users/repositories/user.repository.ts`

### UserMongoRepository (Implementation)

```typescript
@Injectable()
export class UserMongoRepository implements IUserRepository {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find({ isDeleted: false }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { isDeleted: true }).exec();
  }
}
```

**Location**: `src/app/modules/users/repositories/user.mongo.repository.ts`

## Controller

```typescript
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Auth()  // Protected - admin only
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @Auth()  // Protected
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Auth()  // Protected
  findOne(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  @Patch(':id')
  @Auth()  // Protected
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @Auth()  // Protected - admin only
  removeUser(@Param('id') id: string) {
    return this.usersService.removeUser(id);
  }

  @Patch(':id/language')
  @Auth()  // Protected
  updateLanguagePreference(
    @Param('id') id: string,
    @Body() { language }: { language: string },
  ) {
    return this.usersService.updateLanguagePreference(id, language);
  }
}
```

**Location**: `src/app/modules/users/controllers/users.controller.ts`

## DTOs

### CreateUserDto

```typescript
export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  lastname: string;

  @IsStrongPassword()
  password: string;

  @IsEnum(UserType)
  type: UserType;
}
```

### UpdateUserDto

```typescript
export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsEnum(UserType)
  type?: UserType;
}
```

**Location**: `src/app/modules/users/dtos/`

## Module Registration

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    CreateUserUseCase,
    FindAllUsersUseCase,
    FindUserByIdUseCase,
    FindUserByUsernameUseCase,
    UpdateUserUseCase,
    RemoveUserUseCase,
    UpdateLanguagePreferenceUseCase,
    {
      provide: 'IUserRepository',
      useClass: UserMongoRepository,
    },
  ],
  exports: [UsersService, 'IUserRepository'],
})
export class UsersModule {}
```

## Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/users` | POST | ✅ Admin | Create user |
| `/users` | GET | ✅ | Get all users |
| `/users/:id` | GET | ✅ | Get user by ID |
| `/users/:id` | PATCH | ✅ | Update user |
| `/users/:id` | DELETE | ✅ Admin | Delete user |
| `/users/:id/language` | PATCH | ✅ | Update language preference |

## Benefits of Clean Architecture

1. **Testability**: Use cases can be tested independently with mock repositories
2. **Maintainability**: Clear separation of concerns
3. **Flexibility**: Easy to swap MongoDB for PostgreSQL (implement new Repository)
4. **Scalability**: Can add new use cases without modifying existing code
5. **Domain Focus**: Business logic is decoupled from infrastructure

## Example: Testing a Use Case

```typescript
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepository: Partial<IUserRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findByUsername: jest.fn().mockResolvedValue(null),
    };
    useCase = new CreateUserUseCase(
      mockRepository as IUserRepository,
      new CryptoUtils(),
    );
  });

  it('should create a user', async () => {
    const dto: CreateUserDto = {
      username: 'john',
      email: 'john@example.com',
      password: 'SecurePass123!',
      name: 'John',
      lastname: 'Doe',
      type: UserType.USER,
    };

    await useCase.execute(dto);

    expect(mockRepository.create).toHaveBeenCalled();
  });
});
```

---

**Next**: [Posts Module →](./posts.md)
