import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PostsService } from '../services/posts.service';
import { TranslationService } from '../../../core/utils/translation.service';

@WebSocketGateway({
  namespace: 'posts',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class PostsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PostsGateway.name);
  private connectedUsers = new Map<string, { userId: string; username: string }>();

  constructor(
    private readonly postsService: PostsService,
    private readonly i18n: TranslationService,
  ) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
    this.server.emit('user:connected', {
      clientId: client.id,
      totalConnected: this.connectedUsers.size + 1,
    });
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedUsers.delete(client.id);
    this.server.emit('user:disconnected', {
      clientId: client.id,
      totalConnected: this.connectedUsers.size,
    });
  }

  @SubscribeMessage('user:register')
  async handleUserRegister(
    client: Socket,
    data: { userId: string; username: string },
  ): Promise<void> {
    this.connectedUsers.set(client.id, {
      userId: data.userId,
      username: data.username,
    });
    this.logger.log(`User registered: ${data.username} (${client.id})`);
  }

  @SubscribeMessage('posts:list')
  async handlePostsList(client: Socket): Promise<void> {
    try {
      const posts = await this.postsService.findAll();
      client.emit('posts:list:success', {
        posts,
        total: posts.length,
      });
    } catch (error: any) {
      client.emit('error', {
        message: this.i18n.translate('common.error'),
        error: error.message,
      });
    }
  }

  @SubscribeMessage('users:connected')
  async handleGetConnectedUsers(client: Socket): Promise<void> {
    const users = Array.from(this.connectedUsers.values());
    client.emit('users:connected:success', {
      count: users.length,
      users,
    });
  }

  // Internal method called by the controller when a post is created
  notifyPostCreated(post: any, createdBy: string): void {
    if (!this.server) return;
    this.server.emit('post:created', {
      id: post._id || post.id,
      title: post.title,
      content: post.content,
      userId: post.userId,
      status: post.status,
      createdBy,
      createdAt: post.createdAt,
      message: this.i18n.translate('posts.created'),
    });
  }

  // Internal method called by the controller when a post is updated
  notifyPostUpdated(post: any, updatedBy: string): void {
    if (!this.server) return;
    this.server.emit('post:updated', {
      id: post._id || post.id,
      title: post.title,
      content: post.content,
      status: post.status,
      updatedBy,
      updatedAt: post.updatedAt,
      message: this.i18n.translate('posts.updated'),
    });
  }

  // Internal method called by the controller when a post is deleted
  notifyPostDeleted(postId: string, deletedBy: string): void {
    if (!this.server) return;
    this.server.emit('post:deleted', {
      id: postId,
      deletedBy,
      message: this.i18n.translate('posts.deleted'),
    });
  }

  // Internal method called by the controller when a post is published
  notifyPostPublished(post: any, publishedBy: string): void {
    if (!this.server) return;
    this.server.emit('post:published', {
      id: post._id || post.id,
      title: post.title,
      status: post.status,
      publishedBy,
      publishedAt: post.updatedAt,
      message: this.i18n.translate('posts.published'),
    });
  }
}
