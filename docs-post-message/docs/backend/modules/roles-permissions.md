---
sidebar_position: 7
title: Roles & Permissions
description: RBAC - Role-Based Access Control
---

# Roles & Permissions 🎭🔑

Role-Based Access Control system for fine-grained permissions.

## Overview

```mermaid
graph TB
    User["User"]
    Role["Role<br/>admin, user, viewer"]
    Permission["Permission<br/>posts:read, posts:write, ..."]
    
    User -->|has| Role
    Role -->|grants| Permission
```

## Role Schema

```typescript
@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true })
  name: string;  // 'Admin', 'User', 'Viewer'

  @Prop({ required: true, unique: true })
  identifier: string;  // 'admin', 'user', 'viewer'

  @Prop({ type: [Schema.Types.ObjectId], ref: 'Permission', default: [] })
  permissions: Permission[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
```

## Permission Schema

```typescript
@Schema({ timestamps: true })
export class Permission {
  @Prop({ required: true })
  name: string;  // 'Read Posts'

  @Prop({ required: true, unique: true })
  identifier: string;  // 'posts:read'

  @Prop({
    enum: ['user', 'roles', 'permissions', 'comments', 'clients', 'statistics', 'audits'],
  })
  type: string;  // Resource type

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
```

## Modules Status

⚠️ **Both modules are currently ORPHANED** (not imported in AppModule)

See [Orphaned Modules Issue](../issues/orphaned-modules.md)

## Endpoints (When Fixed)

### Roles

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/roles` | POST | Create role |
| `/roles` | GET | Get all roles |
| `/roles/:id` | GET | Get role details |
| `/roles/:id` | PATCH | Update role |
| `/roles/:id` | DELETE | Delete role |

### Permissions

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/permissions` | POST | Create permission |
| `/permissions` | GET | Get all permissions |
| `/permissions/:id` | GET | Get permission details |
| `/permissions/:id` | PATCH | Update permission |
| `/permissions/:id` | DELETE | Delete permission |

## Usage in Application

### Assigning Role to User

```typescript
const user = await usersService.createUser({
  username: 'john',
  email: 'john@example.com',
  role: 'admin',  // Reference to Role
});
```

### Checking Permissions

```typescript
@Controller('posts')
export class PostsController {
  @Delete(':id')
  @Auth()
  @HasPermission('posts:delete')  // Check permission
  deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(id);
  }
}
```

## Default Roles & Permissions

Seed data should create:

```typescript
// Roles
{
  name: 'Administrator',
  identifier: 'admin',
  permissions: [/* all permissions */]
}

{
  name: 'User',
  identifier: 'user',
  permissions: [
    'posts:read',
    'posts:create',
    'posts:update:own',
    'comments:read',
    'comments:create',
  ]
}

{
  name: 'Viewer',
  identifier: 'viewer',
  permissions: [
    'posts:read',
    'comments:read',
  ]
}

// Permissions
{
  name: 'Read Posts',
  identifier: 'posts:read',
  type: 'user'
}

{
  name: 'Create Post',
  identifier: 'posts:create',
  type: 'user'
}

{
  name: 'Update Own Post',
  identifier: 'posts:update:own',
  type: 'user'
}

{
  name: 'Delete Post',
  identifier: 'posts:delete',
  type: 'user'
}
```

## Architecture Note

Flat architecture (Service → Model). Consider refactoring to Clean Architecture for consistency.

---

**Next**: [I18n Module →](./i18n.md)
