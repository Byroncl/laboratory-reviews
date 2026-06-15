import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

export interface Notification {
  id: string;
  type: 'post_created' | 'post_favorited' | 'comment_added' | 'post_commented';
  message: string;
  userId: string;
  data: any;
  createdAt: Date;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('NotificationsGateway');
  private userConnections = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    for (const [userId, connections] of this.userConnections.entries()) {
      if (connections.has(client.id)) {
        connections.delete(client.id);
        if (connections.size === 0) {
          this.userConnections.delete(userId);
        }
      }
    }
  }

  @SubscribeMessage('user:register')
  handleUserRegister(client: Socket, data: { userId: string }) {
    const { userId } = data;
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(client.id);
    client.emit('user:registered', { status: 'ok', userId });
    this.logger.log(`User registered: ${userId}`);
  }

  notifyPostCreated(userId: string, post: any) {
    const notification: Notification = {
      id: `post_${post._id}_${Date.now()}`,
      type: 'post_created',
      message: `${post.author} created a new post: "${post.title}"`,
      userId,
      data: { post },
      createdAt: new Date(),
    };
    this.sendToUser(userId, 'notification:post_created', notification);
  }

  notifyPostFavorited(userId: string, clientName: string, postTitle: string) {
    const notification: Notification = {
      id: `favorite_${userId}_${Date.now()}`,
      type: 'post_favorited',
      message: `${clientName} favorited your post: "${postTitle}"`,
      userId,
      data: { clientName, postTitle },
      createdAt: new Date(),
    };
    this.sendToUser(userId, 'notification:post_favorited', notification);
  }

  notifyCommentAdded(postAuthorId: string, commentAuthorName: string, postTitle: string) {
    const notification: Notification = {
      id: `comment_${postAuthorId}_${Date.now()}`,
      type: 'post_commented',
      message: `${commentAuthorName} commented on your post: "${postTitle}"`,
      userId: postAuthorId,
      data: { commentAuthorName, postTitle },
      createdAt: new Date(),
    };
    this.sendToUser(postAuthorId, 'notification:comment_added', notification);
  }

  private sendToUser(userId: string, event: string, data: any) {
    const connections = this.userConnections.get(userId);
    if (connections && connections.size > 0) {
      connections.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
    }
  }

  broadcastNewPost(post: any) {
    this.server.emit('post:created', { post });
  }
}
