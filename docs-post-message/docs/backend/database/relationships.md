---
sidebar_position: 2
title: Schema Relationships
description: MongoDB relationships and population
---

# Database Relationships 🔗

How schemas relate to each other in MongoDB.

## Relationship Types

### One-to-Many (1:N)

**User → Posts**

A user can create many posts.

```typescript
// In Post schema
@Prop({ type: Schema.Types.ObjectId, ref: 'User' })
author: User;

// Usage
const post = await postModel
  .findById(id)
  .populate('author');  // Fetch author details
```

**Post → Comments**

A post can have many comments.

```typescript
// In Comment schema
@Prop({ type: Schema.Types.ObjectId, ref: 'Post', required: true })
postId: Post;
```

### One-to-One (1:1)

**User → Role**

A user has one role.

```typescript
@Prop({ type: Schema.Types.ObjectId, ref: 'Role' })
role: Role;

// Fetch user with role
const user = await userModel
  .findById(id)
  .populate('role');
```

### One-to-Many (1:N)

**Role → Permissions**

A role grants many permissions.

```typescript
@Prop({ type: [Schema.Types.ObjectId], ref: 'Permission', default: [] })
permissions: Permission[];

// Fetch role with permissions
const role = await roleModel
  .findById(id)
  .populate('permissions');
```

## Populate Pattern

### Single Level

```typescript
const user = await userModel
  .findById(userId)
  .populate('role');

// Result
{
  _id: '123',
  username: 'john',
  role: {
    _id: '456',
    name: 'admin',
    permissions: ['789', '790']  // Still IDs, not populated
  }
}
```

### Multi-Level (Nested)

```typescript
const user = await userModel
  .findById(userId)
  .populate({
    path: 'role',
    populate: {
      path: 'permissions'
    }
  });

// Result
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

### Select Specific Fields

```typescript
const post = await postModel
  .findById(postId)
  .populate('author', 'username email');  // Only these fields

// Result
{
  title: 'My Post',
  author: {
    username: 'john',
    email: 'john@example.com'
    // password_hash omitted
  }
}
```

## Query Examples

```typescript
// Find user and populate role with permissions
const user = await userModel
  .findById(userId)
  .populate({
    path: 'role',
    populate: {
      path: 'permissions'
    }
  });

// Find all posts by user, populate author
const posts = await postModel
  .find({ author: userId })
  .populate('author', 'username');

// Find post and all its comments
const post = await postModel
  .findById(postId)
  .populate('comments');
```

## Performance Considerations

### Lean Queries

Don't populate if not needed:

```typescript
// Without .populate() — faster
const posts = await postModel.find().lean();

// With .populate() — slower but includes related data
const posts = await postModel.find().populate('author');
```

### Indexing

Add indexes on frequently joined fields:

```typescript
// In schema
@Prop({ type: Schema.Types.ObjectId, ref: 'User', index: true })
author: User;

@Prop({ type: Schema.Types.ObjectId, ref: 'Post', index: true })
postId: Post;
```

### Aggregation Framework

For complex queries:

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

## Soft Deletes

Don't fetch deleted documents:

```typescript
const posts = await postModel
  .find({ isDeleted: false })
  .populate('author');
```

---

**Next**: [Summary](../intro.md)
