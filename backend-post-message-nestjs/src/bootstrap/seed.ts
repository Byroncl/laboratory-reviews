import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

interface SeedConfig {
  enabled: boolean;
  clearBefore: boolean;
  usersCount: number;
  postsPerUser: number;
  commentsPerPost: number;
  reactionsPerComment: number;
}

export async function seedDatabase(): Promise<void> {
  const config: SeedConfig = {
    enabled: process.env.SEED_ENABLED === 'true',
    clearBefore: process.env.SEED_CLEAR === 'true',
    usersCount: parseInt(process.env.SEED_USERS ?? '5', 10),
    postsPerUser: parseInt(process.env.SEED_POSTS ?? '3', 10),
    commentsPerPost: parseInt(process.env.SEED_COMMENTS ?? '5', 10),
    reactionsPerComment: parseInt(process.env.SEED_REACTIONS ?? '3', 10),
  };

  if (!config.enabled) {
    console.log('Seed disabled (set SEED_ENABLED=true to enable)');
    return;
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    console.log('Starting database seed...');

    if (config.clearBefore) {
      console.log('Clearing existing data...');
      await clearCollections(app);
    }

    const categories = await seedCategories(app);
    const permissions = await seedPermissions(app);
    const roles = await seedRoles(app, permissions);
    const users = await seedUsers(app, config.usersCount, roles);
    const posts = await seedPosts(app, users, categories, config.postsPerUser);
    await seedComments(
      app,
      posts,
      users,
      config.commentsPerPost,
      config.reactionsPerComment,
    );

    console.log('Seed completed successfully!');
    console.log(`   - Permissions: ${permissions.length}`);
    console.log(`   - Roles: ${roles.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Posts: ${posts.length}`);
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

const SEED_PERMISSIONS = [
  { name: 'Create Posts', identifier: 'posts:create', type: 'user' as const },
  { name: 'Read Posts', identifier: 'posts:read', type: 'user' as const },
  { name: 'Update Posts', identifier: 'posts:update', type: 'user' as const },
  { name: 'Delete Posts', identifier: 'posts:delete', type: 'user' as const },
  {
    name: 'Create Comments',
    identifier: 'comments:create',
    type: 'user' as const,
  },
  {
    name: 'Delete Comments',
    identifier: 'comments:delete',
    type: 'user' as const,
  },
  {
    name: 'Manage Categories',
    identifier: 'categories:manage',
    type: 'user' as const,
  },
  { name: 'Manage Users', identifier: 'users:manage', type: 'user' as const },
  { name: 'Manage Roles', identifier: 'roles:manage', type: 'roles' as const },
  {
    name: 'Manage Permissions',
    identifier: 'permissions:manage',
    type: 'permissions' as const,
  },
  { name: 'Read Audits', identifier: 'audits:read', type: 'audits' as const },
];

async function seedPermissions(app: {
  get: (token: unknown) => unknown;
}): Promise<Array<{ _id: unknown; identifier: string; name: string }>> {
  const PermissionModel = app.get(getModelToken('Permission')) as {
    findOne: (filter: unknown) => { exec: () => Promise<unknown> };
    create: (
      data: unknown,
    ) => Promise<{ _id: unknown; identifier: string; name: string }>;
  };

  const permissions: Array<{ _id: unknown; identifier: string; name: string }> =
    [];

  for (const data of SEED_PERMISSIONS) {
    const existing = await PermissionModel.findOne({
      identifier: data.identifier,
    }).exec();
    if (existing) {
      permissions.push(
        existing as { _id: unknown; identifier: string; name: string },
      );
      console.log(`   Skipped existing permission: ${data.name}`);
      continue;
    }
    const permission = await PermissionModel.create(data);
    permissions.push(permission);
    console.log(`   Created permission: ${data.name}`);
  }

  return permissions;
}

async function seedRoles(
  app: { get: (token: unknown) => unknown },
  permissions: Array<{ _id: unknown; identifier: string; name: string }>,
): Promise<Array<{ _id: unknown; name: string; identifier: string }>> {
  const RoleModel = app.get(getModelToken('Role')) as {
    findOne: (filter: unknown) => { exec: () => Promise<unknown> };
    create: (
      data: unknown,
    ) => Promise<{ _id: unknown; name: string; identifier: string }>;
  };

  const findPermIds = (identifiers: string[]) =>
    permissions
      .filter((p) => identifiers.includes(p.identifier))
      .map((p) => p._id);

  const roleData = [
    {
      name: 'Admin',
      identifier: 'admin',
      description: 'Administrator with full access',
      permissions: findPermIds(SEED_PERMISSIONS.map((p) => p.identifier)),
      isActive: true,
    },
    {
      name: 'Moderator',
      identifier: 'moderator',
      description: 'Can moderate content',
      permissions: findPermIds([
        'posts:create',
        'posts:read',
        'posts:update',
        'posts:delete',
        'comments:create',
        'comments:delete',
      ]),
      isActive: true,
    },
    {
      name: 'User',
      identifier: 'user',
      description: 'Regular user with basic access',
      permissions: findPermIds([
        'posts:create',
        'posts:read',
        'comments:create',
      ]),
      isActive: true,
    },
  ];

  const roles: Array<{ _id: unknown; name: string; identifier: string }> = [];

  for (const data of roleData) {
    const existing = await RoleModel.findOne({
      identifier: data.identifier,
    }).exec();
    if (existing) {
      roles.push(
        existing as { _id: unknown; name: string; identifier: string },
      );
      console.log(`   Skipped existing role: ${data.name}`);
      continue;
    }
    const role = await RoleModel.create(data);
    roles.push(role);
    console.log(`   Created role: ${data.name}`);
  }

  return roles;
}

async function clearCollections(app: {
  get: (token: unknown) => unknown;
}): Promise<void> {
  const connection = app.get(getConnectionToken()) as Connection;
  const collections = connection.collections;

  for (const [name, collection] of Object.entries(collections)) {
    if (!name.startsWith('system')) {
      await collection.deleteMany({});
      console.log(`   - Cleared ${name}`);
    }
  }
}

const SEED_CATEGORIES = [
  {
    name: 'Backend',
    slug: 'backend',
    color: '#3B82F6',
    description: 'Server-side development and APIs',
  },
  {
    name: 'Frontend',
    slug: 'frontend',
    color: '#10B981',
    description: 'UI development and frameworks',
  },
  {
    name: 'DevOps',
    slug: 'devops',
    color: '#F59E0B',
    description: 'Infrastructure, CI/CD, and deployment',
  },
  {
    name: 'Database',
    slug: 'database',
    color: '#EF4444',
    description: 'Database design and optimization',
  },
  {
    name: 'Testing',
    slug: 'testing',
    color: '#8B5CF6',
    description: 'Testing strategies and tools',
  },
];

async function seedCategories(app: {
  get: (token: unknown) => unknown;
}): Promise<Array<{ _id: unknown; name: string; slug: string }>> {
  const CategoryModel = app.get(getModelToken('Category')) as {
    findOne: (filter: unknown) => { exec: () => Promise<unknown> };
    create: (
      data: unknown,
    ) => Promise<{ _id: unknown; name: string; slug: string }>;
  };

  const categories: Array<{ _id: unknown; name: string; slug: string }> = [];

  for (const data of SEED_CATEGORIES) {
    const existing = await CategoryModel.findOne({ slug: data.slug }).exec();
    if (existing) {
      categories.push(existing as { _id: unknown; name: string; slug: string });
      console.log(`   Skipped existing category: ${data.name}`);
      continue;
    }
    const category = await CategoryModel.create(data);
    categories.push(category);
    console.log(`   Created category: ${data.name}`);
  }

  return categories;
}

const SEED_USERS = [
  { firstName: 'Sofi', type: 'user' },
  { firstName: 'Joselin', type: 'user' },
  { firstName: 'Charlie', type: 'admin' },
  { firstName: 'Bibi', type: 'user' },
  { firstName: 'Fioravanti', type: 'user' },
  { firstName: 'Idrovo', type: 'user' },
  { firstName: 'Bianca', type: 'admin' },
  { firstName: 'Byron', type: 'user' },
];

const POST_TITLES = [
  'Getting Started with NestJS',
  'Angular 18 Best Practices',
  'MongoDB Indexing Guide',
  'WebSocket Real-time Updates',
  'Clean Architecture in Backend',
  'Testing Strategies',
  'Performance Optimization',
  'Security Best Practices',
];

const POST_BODIES = [
  'Learn how to build scalable backend applications with NestJS and TypeScript.',
  'Discover modern Angular patterns for building reactive applications.',
  'Optimize your MongoDB queries with proper indexing strategies.',
  'Implement real-time features using WebSocket technology.',
  'Structure your backend following clean architecture principles.',
  'Write reliable tests for your NestJS and Angular applications.',
  'Improve application performance through caching and optimization.',
  'Secure your API with authentication and authorization.',
];

// Map post titles to category indices (align with SEED_CATEGORIES order)
const POST_CATEGORY_MAP: Record<string, number> = {
  'Getting Started with NestJS': 0, // Backend
  'Angular 18 Best Practices': 1, // Frontend
  'MongoDB Indexing Guide': 3, // Database
  'WebSocket Real-time Updates': 0, // Backend
  'Clean Architecture in Backend': 0, // Backend
  'Testing Strategies': 4, // Testing
  'Performance Optimization': 2, // DevOps
  'Security Best Practices': 0, // Backend
};

async function seedUsers(
  app: { get: (token: unknown) => unknown },
  count: number,
  roles: Array<{ _id: unknown; name: string; identifier: string }>,
): Promise<Array<{ _id: unknown; username: string }>> {
  const UserModel = app.get(getModelToken('User')) as {
    findOne: (filter: unknown) => { exec: () => Promise<{ _id: unknown; username: string } | null> };
    create: (data: unknown) => Promise<{ _id: unknown; username: string }>;
  };
  const users: Array<{ _id: unknown; username: string }> = [];

  const adminRole = roles.find((r) => r.identifier === 'admin');
  const moderatorRole = roles.find((r) => r.identifier === 'moderator');
  const userRole = roles.find((r) => r.identifier === 'user');

  // Role assignment: index 0,1 → admin type; index 2 → moderator; rest → user
  const roleAssignment = [adminRole, adminRole, moderatorRole];

  const limit = Math.min(count, SEED_USERS.length);
  for (let i = 0; i < limit; i++) {
    const { firstName, type } = SEED_USERS[i];
    const username = firstName.toLowerCase();

    // Check if user already exists first
    const existing = await UserModel.findOne({ username }).exec();
    if (existing) {
      users.push(existing);
      console.log(`   Skipped existing user: ${firstName}`);
      continue;
    }

    try {
      const assignedRole = roleAssignment[i] ?? userRole;
      const user = await UserModel.create({
        name: firstName,
        lastname: 'Seed',
        username,
        email: `${username}@example.com`,
        password_hash: `$2b$10$seed.hash.for.${username}`,
        type,
        isActive: true,
        preferredLanguage: i % 2 === 0 ? 'en' : 'es',
        role: assignedRole ? assignedRole._id : undefined,
      });
      users.push(user);
      console.log(
        `   Created user: ${firstName} (${assignedRole?.name ?? 'no role'})`,
      );
    } catch (error) {
      if (error instanceof Error && (error.message.includes('E11000') || error.message.includes('duplicate key'))) {
        console.log(`   User ${firstName} duplicate on create, fetching...`);
        const existingAfterError = await UserModel.findOne({ username }).exec();
        if (existingAfterError) {
          users.push(existingAfterError);
        }
      } else {
        throw error;
      }
    }
  }

  return users;
}

async function seedPosts(
  app: { get: (token: unknown) => unknown },
  users: Array<{ _id: unknown; username: string }>,
  categories: Array<{ _id: unknown; name: string; slug: string }>,
  postsPerUser: number,
): Promise<Array<{ _id: unknown }>> {
  const PostModel = app.get(getModelToken('Post')) as {
    create: (data: unknown) => Promise<{ _id: unknown }>;
  };
  const posts: Array<{ _id: unknown }> = [];
  const totalPostsToCreate = 11;

  for (let i = 0; i < totalPostsToCreate; i++) {
    const user = users[i % users.length];
    const title = POST_TITLES[i % POST_TITLES.length];
    const categoryIndex = POST_CATEGORY_MAP[title] ?? i % categories.length;
    const category =
      categories[categoryIndex] ?? categories[i % categories.length];

    // Every second post will have an imageUrl that doesn't exist
    const imageUrl = i % 2 === 0 ? `http://localhost:3000/uploads/fake-image-seed-${i}.jpg` : undefined;

    const post = await PostModel.create({
      title,
      body: POST_BODIES[i % POST_BODIES.length],
      author: user.username,
      isActive: true,
      isDeleted: false,
      categoryId: category._id,
      categoryName: category.name,
      status: 'published',
      imageUrl,
    });
    posts.push(post);
  }

  console.log(`   Created ${posts.length} posts`);
  return posts;
}

async function seedComments(
  app: { get: (token: unknown) => unknown },
  posts: Array<{ _id: unknown }>,
  users: Array<{ _id: unknown; username: string }>,
  commentsPerPost: number,
  reactionsPerComment: number,
): Promise<void> {
  const CommentModel = app.get(getModelToken('Comment')) as {
    create: (data: unknown) => Promise<{ _id: unknown }>;
    updateOne: (filter: unknown, update: unknown) => Promise<unknown>;
  };
  const ReactionModel = app.get(getModelToken('Reaction')) as {
    create: (data: unknown) => Promise<unknown>;
  };

  const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];
  let totalComments = 0;
  let totalReactions = 0;

  for (const post of posts) {
    const postComments: Array<{ _id: unknown }> = [];

    for (let i = 0; i < commentsPerPost; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const comment = await CommentModel.create({
        content: `Great ${i % 2 === 0 ? 'post' : 'article'}! Very informative content here.`,
        userId: String(user._id),
        author: user.username,
        postId: String(post._id),
        parentCommentId: null,
        childCommentIds: [],
        isActive: true,
        isDeleted: false,
      });
      postComments.push(comment);
      totalComments++;

      // Add a reply for every 3rd comment
      if (i % 3 === 0) {
        const replyUser = users[Math.floor(Math.random() * users.length)];
        const reply = await CommentModel.create({
          content: 'I agree completely! Great insight.',
          userId: String(replyUser._id),
          author: replyUser.username,
          postId: String(post._id),
          parentCommentId: String(comment._id),
          childCommentIds: [],
          isActive: true,
          isDeleted: false,
        });

        await CommentModel.updateOne(
          { _id: comment._id },
          { $push: { childCommentIds: String(reply._id) } },
        );
        totalComments++;
      }
    }

    // Add reactions to comments
    for (const comment of postComments) {
      for (let r = 0; r < reactionsPerComment; r++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];

        try {
          await ReactionModel.create({
            commentId: String(comment._id),
            userId: String(user._id),
            emoji,
          });
          totalReactions++;
        } catch {
          // Duplicate reaction (unique index), skip silently
        }
      }
    }
  }

  console.log(`   Created ${totalComments} comments`);
  console.log(`   Created ${totalReactions} reactions`);
}
