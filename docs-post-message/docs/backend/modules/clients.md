---
sidebar_position: 6
title: Clients Module
description: Client user management
---

# Clients Module 👤

Manages client accounts (different from regular users).

## Overview

Similar to Users but for client authentication and management.

## Schema

```typescript
@Schema({ timestamps: true })
export class Client {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()  // Note: plain text, not hashed
  password?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  lastname: string;

  @Prop({ enum: ['user', 'admin', 'client'], default: 'client' })
  type: string;

  @Prop({ type: Schema.Types.ObjectId, ref: 'Role' })
  role: Role;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
```

⚠️ **Note**: Client has `password` (plain text), not `password_hash` like User

## Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/clients` | POST | ✅ | Create client |
| `/clients` | GET | ✅ | Get all clients |
| `/clients/:id` | GET | ✅ | Get client |
| `/clients/:id` | PATCH | ✅ | Update client |
| `/clients/:id` | DELETE | ✅ | Delete client |

## Notes

- Flat architecture (Service → Model)
- No specific authentication method (may use basic auth)
- Consider migrating to Clean Architecture pattern

---

**Next**: [Roles & Permissions →](./roles-permissions.md)
