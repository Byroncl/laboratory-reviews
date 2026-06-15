---
sidebar_position: 6
title: Módulo Clients
description: Gestión de usuarios cliente
---

# Módulo Clients 👤

Gestiona las cuentas de clientes (diferente de los usuarios regulares).

## Descripción General

Similar a Users pero para autenticación y gestión de clientes.

## Schema

```typescript
@Schema({ timestamps: true })
export class Client {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()  // Nota: texto plano, no hasheado
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

⚠️ **Nota**: Client tiene `password` (texto plano), no `password_hash` como User

## Endpoints

| Endpoint | Método | Auth | Propósito |
|----------|--------|------|---------|
| `/clients` | POST | ✅ | Crear cliente |
| `/clients` | GET | ✅ | Obtener todos los clientes |
| `/clients/:id` | GET | ✅ | Obtener cliente |
| `/clients/:id` | PATCH | ✅ | Actualizar cliente |
| `/clients/:id` | DELETE | ✅ | Eliminar cliente |

## Notas

- Arquitectura plana (Servicio → Modelo)
- Sin método de autenticación específico (puede usar autenticación básica)
- Considerar migrar al patrón de Arquitectura Limpia

---

**Siguiente**: [Roles y Permisos →](./roles-permissions.md)
