---
sidebar_position: 2
title: Problema de Módulos Huérfanos
description: RolesModule y PermissionsModule no están importados
---

# Módulos Huérfanos ⚠️

## Problema

Dos módulos están definidos pero no importados en `AppModule`:

- **RolesModule**
- **PermissionsModule**

**Archivo**: `src/app/app.module.ts`

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
    // ❌ RolesModule NO importado
    // ❌ PermissionsModule NO importado
    I18nModule,
  ],
})
export class AppModule {}
```

## Impacto

- **Controladores inaccesibles** — `RolesController` y `PermissionsController` nunca se registran
- **Servicios no inyectables** — `RolesService` y `PermissionsService` no están disponibles
- **Endpoints devuelven 404** — `/roles/*` y `/permissions/*` no están disponibles
- **API incompleta** — La gestión de roles y permisos no está disponible

## Solución

### 1. Importar Módulos en AppModule

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
    RolesModule,          // ✅ Agregar esto
    PermissionsModule,    // ✅ Agregar esto
    I18nModule,
  ],
})
export class AppModule {}
```

### 2. Verificar Estructura de Módulos

Asegurarse de que cada módulo exporta sus servicios:

```typescript
// roles.module.ts
@Module({
  imports: [MongooseModule.forFeature([...])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],  // ✅ Exportar para otros módulos
})
export class RolesModule {}

// permissions.module.ts
@Module({
  imports: [MongooseModule.forFeature([...])],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],  // ✅ Exportar para otros módulos
})
export class PermissionsModule {}
```

### 3. Probar Endpoints

```bash
# Antes de la corrección: 404
curl http://localhost:3000/roles

# Después de la corrección: 200
curl http://localhost:3000/roles
```

## Endpoints a Habilitar

### Roles

| Endpoint | Método | Propósito |
|----------|--------|---------|
| `/roles` | POST | Crear rol |
| `/roles` | GET | Obtener todos los roles |
| `/roles/:id` | GET | Obtener rol |
| `/roles/:id` | PATCH | Actualizar rol |
| `/roles/:id` | DELETE | Eliminar rol |

### Permisos

| Endpoint | Método | Propósito |
|----------|--------|---------|
| `/permissions` | POST | Crear permiso |
| `/permissions` | GET | Obtener todos los permisos |
| `/permissions/:id` | GET | Obtener permiso |
| `/permissions/:id` | PATCH | Actualizar permiso |
| `/permissions/:id` | DELETE | Eliminar permiso |

## Pasos de Implementación

1. [ ] Agregar import de `RolesModule` a `AppModule`
2. [ ] Agregar import de `PermissionsModule` a `AppModule`
3. [ ] Verificar que los exports de los módulos son correctos
4. [ ] Probar que los endpoints son accesibles
5. [ ] Actualizar la documentación de la API
6. [ ] Agregar endpoints a Swagger

## Relacionado

- [Documentación de Estructura de Módulos](../architecture/module-structure.md)
- [Módulo Roles](../modules/roles-permissions.md)

---

**Gravedad**: 🟡 ALTA
**Impacto**: Gestión de roles y permisos no disponible
**Plazo**: Debería corregirse en la próxima versión

**Siguiente**: [Inconsistencia I18n →](./i18n-inconsistency.md)
