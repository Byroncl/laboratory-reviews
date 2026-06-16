import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PermissionsService } from '../permissions/services/permissions.service';
import { RolesService } from '../roles/services/roles.service';
import { UsersService } from '../users/services/users.service';
import { ClientsService } from '../clients/services/clients.service';
import { CategoriesService } from '../categories/services/categories.service';
import { PostsService } from '../posts/services/posts.service';
import { CommentsService } from '../comments/services/comments.service';
import { FavoritesService } from '../favorites/services/favorites.service';
import { NotificationsService } from '../notifications/services/notifications.service';
import { NOTIFICATION_TYPES } from '../notifications/constants/notifications.constants';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { PermissionType } from '../permissions/schemas/permission.schema';
import * as crypto from 'crypto';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService,
    private readonly clientsService: ClientsService,
    private readonly categoriesService: CategoriesService,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private readonly favoritesService: FavoritesService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.logger.log('SeederService constructor called - module loading');
  }

  async onModuleInit(): Promise<void> {
    try {
      const seedEnv = process.env.SEED_DATABASE;
      this.logger.log(
        `SEED_DATABASE env value: "${seedEnv}" (type: ${typeof seedEnv})`,
      );
      const shouldSeed = seedEnv === 'true';
      if (!shouldSeed) {
        this.logger.log('Seeding disabled');
        return;
      }

      this.logger.log('🌱 Starting database seeding...');
      await this.seed();
      this.logger.log('✅ Database seeding completed successfully');
    } catch (error) {
      this.logger.error(
        '❌ Seeding failed:',
        error instanceof Error ? error.message : error,
      );
      // Don't throw to allow app to continue running
    }
  }

  private async seed(): Promise<void> {
    // 1. Permissions
    const permissions = await this.seedPermissions();

    // 2. Roles
    const roles = await this.seedRoles(permissions);

    // 3. Users & Clients
    const users = await this.seedUsers(roles);
    const clients = await this.seedClients(roles);

    // 4. Categories
    const categories = await this.seedCategories();

    // 5. Posts
    const posts = await this.seedPosts(clients, categories);

    // 6. Comments
    const comments = await this.seedComments(posts, users);

    // 7. Favorites
    await this.seedFavorites(clients, posts);

    // 8. Notifications
    await this.seedNotifications(users, posts, comments);
  }

  private async seedPermissions(): Promise<any[]> {
    this.logger.log('📋 Seeding permissions...');

    const permissionData: any[] = [
      {
        name: 'Create User',
        identifier: 'create_user',
        type: 'user' as PermissionType,
      },
      { name: 'Update User', identifier: 'update_user', type: 'user' },
      { name: 'Delete User', identifier: 'delete_user', type: 'user' },
      { name: 'View Users', identifier: 'view_users', type: 'user' },
      { name: 'Manage Users', identifier: 'users:manage', type: 'user' },

      { name: 'Create Role', identifier: 'create_role', type: 'roles' },
      { name: 'Update Role', identifier: 'update_role', type: 'roles' },
      { name: 'Delete Role', identifier: 'delete_role', type: 'roles' },
      { name: 'Assign Role', identifier: 'assign_role', type: 'roles' },

      {
        name: 'Manage Permissions',
        identifier: 'manage_permissions',
        type: 'permissions',
      },

      { name: 'Create Post', identifier: 'create_post', type: 'posts' },
      { name: 'Update Post', identifier: 'update_post', type: 'posts' },
      { name: 'Delete Post', identifier: 'delete_post', type: 'posts' },
      { name: 'View Posts', identifier: 'view_posts', type: 'posts' },

      {
        name: 'Create Comment',
        identifier: 'create_comment',
        type: 'comments',
      },
      {
        name: 'Delete Comment',
        identifier: 'delete_comment',
        type: 'comments',
      },
      { name: 'Add Reaction', identifier: 'add_reaction', type: 'comments' },

      {
        name: 'View Analytics',
        identifier: 'view_analytics',
        type: 'statistics',
      },

      {
        name: 'View Audit Logs',
        identifier: 'view_audit_logs',
        type: 'audits',
      },
    ];

    const permissions: any[] = [];
    for (const perm of permissionData) {
      try {
        const created = await this.permissionsService.create(perm);
        permissions.push(created);
      } catch (error) {
        // Permission might already exist
      }
    }

    this.logger.log(`✓ ${permissions.length} permissions seeded`);
    return permissions;
  }

  private async seedRoles(permissions: any[]): Promise<any[]> {
    this.logger.log('👥 Seeding roles...');

    const roleData = [
      {
        name: 'Admin',
        identifier: 'admin',
        permissions: permissions.map((p) => p._id),
      },
      {
        name: 'Moderator',
        identifier: 'moderator',
        permissions: permissions
          .filter(
            (p) =>
              ['posts', 'comments', 'view_audit_logs'].includes(p.type) ||
              p.identifier.includes('view'),
          )
          .map((p) => p._id),
      },
      {
        name: 'User',
        identifier: 'user',
        permissions: permissions
          .filter((p) =>
            ['create_post', 'create_comment', 'add_reaction'].includes(
              p.identifier,
            ),
          )
          .map((p) => p._id),
      },
    ];

    const roles: any[] = [];
    for (const role of roleData) {
      try {
        const created = await this.rolesService.create(role);
        roles.push(created);
      } catch (error) {
        // Role might already exist
      }
    }

    this.logger.log(`✓ ${roles.length} roles seeded`);
    return roles;
  }

  private async seedUsers(roles: any[]): Promise<any[]> {
    this.logger.log('👨 Seeding users...');

    const adminRole = roles.find((r) => r.identifier === 'admin');
    const userRole = roles.find((r) => r.identifier === 'user');

    const userData = [
      {
        name: 'Admin',
        lastname: 'User',
        username: 'admin',
        email: 'admin@example.com',
        password_hash: 'SecurePassword123!',
        role: adminRole?._id,
        type: 'admin',
        isVerified: true,
        isActive: true,
      },
      {
        name: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password_hash: 'SecurePassword123!',
        role: userRole?._id,
        type: 'user',
        isVerified: true,
        isActive: true,
      },
      {
        name: 'Jane',
        lastname: 'Smith',
        username: 'janesmith',
        email: 'jane@example.com',
        password_hash: 'SecurePassword123!',
        role: userRole?._id,
        type: 'user',
        isVerified: true,
        isActive: true,
      },
      {
        name: 'Bob',
        lastname: 'Johnson',
        username: 'bobjohnson',
        email: 'bob@example.com',
        password_hash: 'SecurePassword123!',
        role: userRole?._id,
        type: 'user',
        isVerified: false,
        isActive: true,
      },
    ];

    const users: any[] = [];
    for (const user of userData) {
      try {
        const created = await this.usersService.create(user);
        users.push(created);
      } catch (error) {
        // User might already exist
      }
    }

    this.logger.log(`✓ ${users.length} users seeded`);
    return users;
  }

  private async seedClients(roles: any[]): Promise<any[]> {
    this.logger.log('🏢 Seeding clients...');

    const clientRole = roles.find((r) => r.identifier === 'user');

    const clientData = [
      {
        name: 'Tech',
        lastname: 'Corp',
        username: 'techcorp',
        email: 'contact@techcorp.com',
        password_hash: 'SecurePassword123!',
        role: clientRole?._id,
        type: 'client',
        isActive: true,
      },
      {
        name: 'Design',
        lastname: 'Studio',
        username: 'designstudio',
        email: 'hello@designstudio.com',
        password_hash: 'SecurePassword123!',
        role: clientRole?._id,
        type: 'client',
        isActive: true,
      },
      {
        name: 'Marketing',
        lastname: 'Agency',
        username: 'marketingagency',
        email: 'info@marketingagency.com',
        password_hash: 'SecurePassword123!',
        role: clientRole?._id,
        type: 'client',
        isActive: true,
      },
    ];

    const clients: any[] = [];
    for (const client of clientData) {
      try {
        const created = await this.clientsService.create(client);
        clients.push(created);
      } catch (error) {
        // Client might already exist
      }
    }

    this.logger.log(`✓ ${clients.length} clients seeded`);
    return clients;
  }

  private async seedCategories(): Promise<any[]> {
    this.logger.log('📚 Seeding categories...');

    const categoryData = [
      {
        name: 'Technology',
        slug: 'technology',
        description: 'Latest news and insights about technology',
        color: '#007AFF',
      },
      {
        name: 'Design',
        slug: 'design',
        description: 'Design trends, tips, and best practices',
        color: '#FF2D55',
      },
      {
        name: 'Business',
        slug: 'business',
        description: 'Business insights and strategies',
        color: '#34C759',
      },
      {
        name: 'Marketing',
        slug: 'marketing',
        description: 'Marketing tips and case studies',
        color: '#FF9500',
      },
      {
        name: 'Development',
        slug: 'development',
        description: 'Software development best practices',
        color: '#5856D6',
      },
    ];

    const categories: any[] = [];
    for (const category of categoryData) {
      try {
        const created = await this.categoriesService.create(category);
        categories.push(created);
      } catch (error) {
        // Category might already exist
      }
    }

    this.logger.log(`✓ ${categories.length} categories seeded`);
    return categories;
  }

  private async seedPosts(clients: any[], categories: any[]): Promise<any[]> {
    this.logger.log('📝 Seeding posts...');

    const posts: any[] = [];
    const postData = [
      {
        title: 'The Future of Web Development',
        content:
          'Exploring emerging trends in web development including AI, WebAssembly, and edge computing.',
        author: clients[0]?.name || 'Tech Corp',
        authorId: clients[0]?._id?.toString(),
        categoryId: categories[0]?._id?.toString() || 'technology',
        categoryName: 'Technology',
        imageUrl: 'https://via.placeholder.com/800x400?text=Web+Development',
        status: 'published',
        tags: [
          'web-development',
          'ai',
          'webassembly',
          'edge-computing',
          'future',
        ],
        isActive: true,
        isDeleted: false,
      },
      {
        title: 'Design Systems: Building Scalable UI',
        content:
          'A comprehensive guide to creating design systems that scale across your organization.',
        author: clients[1]?.name || 'Design Studio',
        authorId: clients[1]?._id?.toString(),
        categoryId: categories[1]?._id?.toString() || 'design',
        categoryName: 'Design',
        imageUrl: 'https://via.placeholder.com/800x400?text=Design+Systems',
        status: 'published',
        tags: [
          'design-systems',
          'ui',
          'scalability',
          'component-library',
          'best-practices',
        ],
        isActive: true,
        isDeleted: false,
      },
      {
        title: 'Growth Hacking Strategies for Startups',
        content:
          'Proven strategies to accelerate growth in early-stage startups without massive budgets.',
        author: clients[2]?.name || 'Marketing Agency',
        authorId: clients[2]?._id?.toString(),
        categoryId: categories[3]?._id?.toString() || 'marketing',
        categoryName: 'Marketing',
        imageUrl: 'https://via.placeholder.com/800x400?text=Growth+Hacking',
        status: 'published',
        tags: [
          'growth-hacking',
          'startups',
          'marketing-strategies',
          'viral-growth',
          'acquisition',
        ],
        isActive: true,
        isDeleted: false,
      },
      {
        title: 'API Design Best Practices',
        content:
          'Learn how to design APIs that are intuitive, scalable, and easy to maintain.',
        author: clients[0]?.name || 'Tech Corp',
        authorId: clients[0]?._id?.toString(),
        categoryId: categories[4]?._id?.toString() || 'development',
        categoryName: 'Development',
        imageUrl: 'https://via.placeholder.com/800x400?text=API+Design',
        status: 'published',
        tags: ['api-design', 'rest', 'graphql', 'backend', 'scalability'],
        isActive: true,
        isDeleted: false,
      },
      {
        title: 'Business Strategy in Digital Era',
        content:
          'How traditional businesses can adapt and thrive in the digital age.',
        author: clients[1]?.name || 'Design Studio',
        authorId: clients[1]?._id?.toString(),
        categoryId: categories[2]?._id?.toString() || 'business',
        categoryName: 'Business',
        imageUrl: 'https://via.placeholder.com/800x400?text=Digital+Business',
        status: 'published',
        tags: [
          'business-strategy',
          'digital-transformation',
          'innovation',
          'leadership',
          'future',
        ],
        isActive: true,
        isDeleted: false,
      },
    ];

    for (const post of postData) {
      try {
        const created = await this.postsService.create(post);
        posts.push(created);
      } catch (error) {
        // Post might already exist
      }
    }

    this.logger.log(`✓ ${posts.length} posts seeded`);
    return posts;
  }

  private async seedComments(posts: any[], users: any[]): Promise<any[]> {
    this.logger.log('💬 Seeding comments...');

    const comments: any[] = [];

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const user = users[i % users.length];

      const commentData: any[] = [
        {
          post: post._id.toString(),
          userId: user._id.toString(),
          content: `Great article! This is very helpful for my project.`,
          isActive: true,
          isDeleted: false,
        },
        {
          post: post._id.toString(),
          userId: users[(i + 1) % users.length]._id.toString(),
          content: `Could you elaborate more on this topic? Would love to see some code examples.`,
          isActive: true,
          isDeleted: false,
        },
      ];

      for (const comment of commentData) {
        try {
          const created = await this.commentsService.create(comment);
          comments.push(created);

          // Add a nested reply to the first comment
          if (commentData.indexOf(comment) === 0) {
            const replyData: any = {
              post: post._id.toString(),
              userId: users[(i + 2) % users.length]._id.toString(),
              content: `Thanks for sharing! I agree with your thoughts.`,
              parentCommentId: (created as any)._id?.toString(),
              isActive: true,
              isDeleted: false,
            };

            try {
              const reply = await this.commentsService.create(replyData);
              comments.push(reply);
            } catch (error) {
              // Reply creation might fail
            }
          }
        } catch (error) {
          // Comment might already exist
        }
      }
    }

    this.logger.log(`✓ ${comments.length} comments seeded`);
    return comments;
  }

  private async seedFavorites(clients: any[], posts: any[]): Promise<void> {
    this.logger.log('⭐ Seeding favorites...');

    let count = 0;
    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];
      const postsToFavorite = posts.slice(0, Math.min(3, posts.length));

      for (const post of postsToFavorite) {
        try {
          await this.favoritesService.addFavorite(client._id.toString(), {
            postId: post._id.toString(),
          });
          count++;
        } catch (error) {
          // Favorite might already exist
        }
      }
    }

    this.logger.log(`✓ ${count} favorites seeded`);
  }

  private async seedNotifications(
    users: any[],
    posts: any[],
    comments: any[],
  ): Promise<void> {
    this.logger.log('🔔 Seeding notifications...');

    let count = 0;

    // Notifications for new comments
    for (let i = 0; i < Math.min(3, users.length); i++) {
      const user = users[i];
      const randomComment =
        comments[Math.floor(Math.random() * comments.length)];
      const randomActor = users[Math.floor(Math.random() * users.length)];

      try {
        await this.notificationsService.create({
          userId: user._id.toString(),
          type: NotificationType.COMMENT_CREATED,
          actorId: randomActor._id.toString(),
          actorName: `${randomActor.name} ${randomActor.lastname}`,
          postId: randomComment.postId,
          commentId: randomComment._id.toString(),
          message: `${randomActor.name} commented on a post you follow.`,
        });
        count++;
      } catch (error) {
        // Notification might already exist
      }
    }

    // Notifications for reactions
    for (let i = 0; i < Math.min(2, users.length); i++) {
      const user = users[i];
      const randomActor = users[Math.floor(Math.random() * users.length)];

      try {
        await this.notificationsService.create({
          userId: user._id.toString(),
          type: NotificationType.REACTION_ADDED,
          actorId: randomActor._id.toString(),
          actorName: `${randomActor.name} ${randomActor.lastname}`,
          postId: posts[0]?._id?.toString(),
          emoji: '👍',
          message: `${randomActor.name} reacted to your post.`,
        });
        count++;
      } catch (error) {
        // Notification might already exist
      }
    }

    this.logger.log(`✓ ${count} notifications seeded`);
  }
}
