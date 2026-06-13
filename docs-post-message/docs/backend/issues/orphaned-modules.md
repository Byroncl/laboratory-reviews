---
sidebar_position: 2
title: Orphaned Modules Issue
description: RolesModule and PermissionsModule not imported
---

# Orphaned Modules ⚠️

## Problem

Two modules are defined but not imported in `AppModule`:

- **RolesModule**
- **PermissionsModule**

**File**: `src/app/app.module.ts`

```typescript
@Module({
  imports: [
    ConfigModule,
    MongooseModule,
    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    ClientsModule,
    FilesModule,
    // ❌ RolesModule NOT imported
    // ❌ PermissionsModule NOT imported
    I18nModule,
  ],
})
export class AppModule {}
```

## Impact

- **Controllers unreachable** — `RolesController` and `PermissionsController` never register
- **Services not injectable** — `RolesService` and `PermissionsService` not available
- **Endpoints return 404** — `/roles/*` and `/permissions/*` are not available
- **API incomplete** — Role and permission management unavailable

## Solution

### 1. Import Modules in AppModule

```typescript
@Module({
  imports: [
    ConfigModule,
    MongooseModule,
    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    ClientsModule,
    FilesModule,
    RolesModule,          // ✅ Add this
    PermissionsModule,    // ✅ Add this
    I18nModule,
  ],
})
export class AppModule {}
```

### 2. Verify Module Structure

Ensure each module exports its services:

```typescript
// roles.module.ts
@Module({
  imports: [MongooseModule.forFeature([...])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],  // ✅ Export for other modules
})
export class RolesModule {}

// permissions.module.ts
@Module({
  imports: [MongooseModule.forFeature([...])],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],  // ✅ Export for other modules
})
export class PermissionsModule {}
```

### 3. Test Endpoints

```bash
# Before fix: 404
curl http://localhost:3000/roles

# After fix: 200
curl http://localhost:3000/roles
```

## Endpoints to Enable

### Roles

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/roles` | POST | Create role |
| `/roles` | GET | Get all roles |
| `/roles/:id` | GET | Get role |
| `/roles/:id` | PATCH | Update role |
| `/roles/:id` | DELETE | Delete role |

### Permissions

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/permissions` | POST | Create permission |
| `/permissions` | GET | Get all permissions |
| `/permissions/:id` | GET | Get permission |
| `/permissions/:id` | PATCH | Update permission |
| `/permissions/:id` | DELETE | Delete permission |

## Implementation Steps

1. [ ] Add `RolesModule` import to `AppModule`
2. [ ] Add `PermissionsModule` import to `AppModule`
3. [ ] Verify module exports are correct
4. [ ] Test endpoints are accessible
5. [ ] Update API documentation
6. [ ] Add endpoints to Swagger

## Related

- [Module Structure Documentation](../architecture/module-structure.md)
- [Roles Module](../modules/roles-permissions.md)

---

**Severity**: 🟡 HIGH
**Impact**: Role and permission management unavailable
**Timeline**: Should be fixed in next release

**Next**: [I18n Inconsistency →](./i18n-inconsistency.md)
