---
sidebar_position: 1
title: Auth Module
description: Authentication and JWT token management
---

# Auth Module 🔐

The Auth module handles user authentication, JWT token generation, and validation.

## Overview

```mermaid
graph TB
    subgraph "Auth Module"
        Controller["AuthController<br/>POST /auth/login<br/>POST /auth/register"]
        Service["AuthService<br/>validateUser()<br/>login()"]
        JwtService["JwtService<br/>sign()<br/>verify()"]
    end
    
    subgraph "Dependencies"
        UsersModule["UsersModule<br/>UsersService"]
        PassportModule["PassportModule<br/>JWT Strategy"]
        JwtModule["JwtModule<br/>Token management"]
    end
    
    Controller --> Service
    Service --> UsersModule
    Service --> JwtService
    JwtService --> JwtModule
    JwtModule --> JwtService
```

## Module Structure

```
src/app/modules/auth/
├── controllers/
│   └── auth.controller.ts
├── services/
│   └── auth.service.ts
├── guards/
│   └── jwt-auth.guard.ts      # Legacy Passport-based
├── strategies/
│   └── jwt.strategy.ts        # Passport JWT strategy
├── dtos/
│   ├── login.dto.ts
│   └── register.dto.ts
└── auth.module.ts
```

## Authentication Flow

### Login Flow

```mermaid
sequenceDiagram
    participant Client
    participant Controller as AuthController
    participant Service as AuthService
    participant UsersService
    participant CryptoUtils as CryptoUtils
    participant JwtService
    participant Client2 as Client (authenticated)
    
    Client->>Controller: POST /auth/login { username, password }
    Controller->>Service: validateUser(username, password)
    Service->>UsersService: findByUsername(username)
    UsersService->>Service: user
    Service->>CryptoUtils: comparePasswords(password, user.password_hash)
    CryptoUtils->>Service: true/false
    alt password matches
        Service->>JwtService: sign({ userId, type, role })
        JwtService->>Service: JWT token
        Service->>Controller: { token, user }
        Controller->>Client: { statusCode: 200, data: { token, user }, ... }
    else password doesn't match
        Service->>Controller: Throw UnauthorizedException
        Controller->>Client: { statusCode: 401, message: 'Invalid credentials', ... }
    end
    
    Client2->>Controller: GET /api/protected<br/>Authorization: Bearer {token}
    Controller->>AuthGuard: canActivate()
    AuthGuard->>JwtService: verify(token)
    JwtService->>AuthGuard: { userId, type, role }
    AuthGuard->>Controller: Attach user to request
    Controller->>Protected: Handler with req.user
```

## Services

### AuthService

Handles user authentication:

```typescript
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private cryptoUtils: CryptoUtils,
  ) {}

  // Validate username/password credentials
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findUserByUsername(username);
    if (user && await this.cryptoUtils.comparePasswords(password, user.password_hash)) {
      const { password_hash, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  // Create JWT token from user
  async login(user: any) {
    const payload = {
      userId: user._id,
      type: user.type,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
```

**Location**: `src/app/modules/auth/services/auth.service.ts`

## Controllers

### AuthController

```typescript
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    // Register new user (delegates to UsersService)
    return this.usersService.createUser(registerDto);
  }
}
```

**Location**: `src/app/modules/auth/controllers/auth.controller.ts`

## DTOs

### LoginDto

```typescript
export class LoginDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

### RegisterDto

```typescript
export class RegisterDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsString()
  name: string;

  @IsString()
  lastname: string;

  @IsEnum(UserType)
  type: UserType;
}
```

**Location**: `src/app/modules/auth/dtos/`

## JWT Token Structure

The JWT payload contains:

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "type": "user",
  "role": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "User",
    "permissions": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Read Posts",
        "identifier": "posts:read"
      }
    ]
  },
  "iat": 1686479345,
  "exp": 1686565745
}
```

## Security Configuration

⚠️ **SECURITY ISSUE**: JWT secret is hardcoded in `auth.module.ts`:

```typescript
JwtModule.register({
  secret: 'yourSecretKey',  // ❌ HARDCODED!
  signOptions: { expiresIn: '24h' },
})
```

**Should use environment variable**:
```typescript
secret: process.env.JWT_SECRET || 'fallback-secret',
```

See [Hardcoded Secrets Issue](../issues/hardcoded-secrets.md)

## Guards

### JwtAuthGuard (Legacy)

Passport-based JWT guard (coexists with core AuthGuard):

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): Promise<boolean> {
    return super.canActivate(context) as Promise<boolean>;
  }
}
```

**Location**: `src/app/modules/auth/guards/jwt-auth.guard.ts`

### Core AuthGuard (Recommended)

The main authentication guard is in `core/guards/auth.guard.ts`. Use `@Auth()` decorator to protect routes:

```typescript
@Controller('users')
export class UsersController {
  @Get(':id')
  @Auth()  // Protected with AuthGuard
  findOne(@Param('id') id: string) {
    // Only authenticated users can access
  }

  @Get()
  @Auth({ roles: ['admin'] })  // Only admins
  findAll() {
    // Only admin users can access
  }
}
```

## Strategies

### JwtStrategy

Passport JWT strategy configuration:

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'yourSecretKey',  // ❌ Also hardcoded here
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.userId,
      type: payload.type,
      role: payload.role,
    };
  }
}
```

**Location**: `src/app/modules/auth/strategies/jwt.strategy.ts`

## Module Registration

```typescript
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'yourSecretKey',
      signOptions: { expiresIn: '24h' },
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
```

## Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/auth/login` | POST | ❌ | Login with username/password |
| `/auth/register` | POST | ❌ | Register new user |

## Request/Response Examples

### Login Request

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePass123!"
  }'
```

### Login Response (Success)

```json
{
  "statusCode": 200,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "type": "user"
    }
  },
  "timestamp": "2024-06-13T12:34:56.789Z",
  "success": true
}
```

### Login Response (Failure)

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "timestamp": "2024-06-13T12:34:56.789Z",
  "path": "/auth/login",
  "success": false
}
```

## Usage in Routes

```typescript
@Controller('users')
export class UsersController {
  @Get('profile')
  @Auth()  // Protected - requires valid JWT
  getProfile(@CurrentUser() user: CurrentUserPayload) {
    return user;  // Return current user info
  }

  @Get('admin')
  @Auth({ roles: ['admin'] })  // Protected - only admins
  getAdminData() {
    return { admin: true };
  }

  @Get('public')
  // No @Auth() - public endpoint
  getPublic() {
    return { message: 'Public data' };
  }
}
```

## Related Documentation

- [Core Guards](../core/guards.md)
- [Users Module](./users.md)
- [Decorators](../core/decorators.md)
- [Hardcoded Secrets Issue](../issues/hardcoded-secrets.md)

---

**Next**: [Users Module →](./users.md)
