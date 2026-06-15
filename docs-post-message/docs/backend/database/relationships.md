---
sidebar_position: 2
title: Relaciones entre Schemas
description: Relaciones en MongoDB y populación de datos
---

# Relaciones de Base de Datos 🔗

Cómo se relacionan los schemas entre sí en MongoDB.

## Tipos de Relaciones

### Uno-a-Muchos (1:N)

**Usuario → Posts**

Un usuario puede crear muchos posts.

```typescript
// En el schema de Post
@Prop({ type: Schema.Types.ObjectId, ref: 'User' })
author: User;

// Uso
const post = await postModel
  .findById(id)
  .populate('author');  // Obtener detalles del autor
```

**Post → Comentarios**

Un post puede tener muchos comentarios.

```typescript
// En el schema de Comment
@Prop({ type: Schema.Types.ObjectId, ref: 'Post', required: true })
postId: Post;
```

### Uno-a-Uno (1:1)

**Usuario → Rol**

Un usuario tiene un rol.

```typescript
@Prop({ type: Schema.Types.ObjectId, ref: 'Role' })
role: Role;

// Obtener usuario con rol
const user = await userModel
  .findById(id)
  .populate('role');
```

### Uno-a-Muchos (1:N)

**Rol → Permisos**

Un rol otorga muchos permisos.

```typescript
@Prop({ type: [Schema.Types.ObjectId], ref: 'Permission', default: [] })
permissions: Permission[];

// Obtener rol con permisos
const role = await roleModel
  .findById(id)
  .populate('permissions');
```

## Patrón de Populate

### Nivel Simple

```typescript
const user = await userModel
  .findById(userId)
  .populate('role');

// Resultado
{
  _id: '123',
  username: 'john',
  role: {
    _id: '456',
    name: 'admin',
    permissions: ['789', '790']  // Siguen siendo IDs, no populados
  }
}
```

### Multi-Nivel (Anidado)

```typescript
const user = await userModel
  .findById(userId)
  .populate({
    path: 'role',
    populate: {
      path: 'permissions'
    }
  });

// Resultado
{
  _id: '123',
  username: 'john',
  role: {
    _id: '456',
    name: 'admin',
    permissions: [
      { _id: '789', name: 'posts:read', ... },
      { _id: '790', name: 'posts:write', ... }
    ]
  }
}
```

### Seleccionar Campos Específicos

```typescript
const post = await postModel
  .findById(postId)
  .populate('author', 'username email');  // Solo estos campos

// Resultado
{
  title: 'My Post',
  author: {
    username: 'john',
    email: 'john@example.com'
    // password_hash omitido
  }
}
```

## Ejemplos de Consultas

```typescript
// Buscar usuario y popularlo con rol y permisos
const user = await userModel
  .findById(userId)
  .populate({
    path: 'role',
    populate: {
      path: 'permissions'
    }
  });

// Buscar todos los posts de un usuario, populando el autor
const posts = await postModel
  .find({ author: userId })
  .populate('author', 'username');

// Buscar post y todos sus comentarios
const post = await postModel
  .findById(postId)
  .populate('comments');
```

## Consideraciones de Rendimiento

### Consultas Lean

No poblar si no es necesario:

```typescript
// Sin .populate() — más rápido
const posts = await postModel.find().lean();

// Con .populate() — más lento pero incluye datos relacionados
const posts = await postModel.find().populate('author');
```

### Indexación

Agregar índices en campos que se unen frecuentemente:

```typescript
// En el schema
@Prop({ type: Schema.Types.ObjectId, ref: 'User', index: true })
author: User;

@Prop({ type: Schema.Types.ObjectId, ref: 'Post', index: true })
postId: Post;
```

### Framework de Agregación

Para consultas complejas:

```typescript
const posts = await postModel.aggregate([
  {
    $match: { author: new ObjectId(userId) }
  },
  {
    $lookup: {
      from: 'users',
      localField: 'author',
      foreignField: '_id',
      as: 'author'
    }
  },
  {
    $unwind: '$author'
  }
]);
```

## Borrado Lógico

No obtener documentos eliminados:

```typescript
const posts = await postModel
  .find({ isDeleted: false })
  .populate('author');
```

---

**Siguiente**: [Resumen](../intro.md)
