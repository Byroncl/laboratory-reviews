import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { I18nService } from '../../../core/i18n/i18n.service';

@WebSocketGateway({
  namespace: 'users',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(UsersGateway.name);
  private connectedUsers = new Map<string, { userId: string; username: string }>();

  constructor(
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
    if (this.server) {
      this.server.emit('user:connected', {
        clientId: client.id,
        totalConnected: this.connectedUsers.size + 1,
      });
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedUsers.delete(client.id);
    if (this.server) {
      this.server.emit('user:disconnected', {
        clientId: client.id,
        totalConnected: this.connectedUsers.size,
      });
    }
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

  @SubscribeMessage('users:list')
  async handleUsersList(client: Socket): Promise<void> {
    try {
      const users = await this.usersService.findAll();
      client.emit('users:list:success', {
        users,
        total: users.length,
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

  // Internal method called by the controller when a user is created
  notifyUserCreated(user: any, createdBy: string): void {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized, skipping user:created notification');
      return;
    }
    try {
      this.server.emit('user:created', {
        id: user._id || user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        createdBy,
        createdAt: user.createdAt,
        message: this.i18n.translate('users.created'),
      });
    } catch (error: any) {
      this.logger.error(`Failed to notify user:created: ${error.message}`);
    }
  }

  // Internal method called by the controller when a user is updated
  notifyUserUpdated(user: any, updatedBy: string): void {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized, skipping user:updated notification');
      return;
    }
    try {
      this.server.emit('user:updated', {
        id: user._id || user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        updatedBy,
        updatedAt: user.updatedAt,
        message: this.i18n.translate('users.updated'),
      });
    } catch (error: any) {
      this.logger.error(`Failed to notify user:updated: ${error.message}`);
    }
  }

  // Internal method called by the controller when a user is deleted
  notifyUserDeleted(userId: string, deletedBy: string): void {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized, skipping user:deleted notification');
      return;
    }
    try {
      this.server.emit('user:deleted', {
        id: userId,
        deletedBy,
        message: this.i18n.translate('users.deleted'),
      });
    } catch (error: any) {
      this.logger.error(`Failed to notify user:deleted: ${error.message}`);
    }
  }

  // Internal method called by the controller when a user is activated
  notifyUserActivated(user: any, activatedBy: string): void {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized, skipping user:activated notification');
      return;
    }
    try {
      this.server.emit('user:activated', {
        id: user._id || user.id,
        username: user.username,
        status: user.status,
        activatedBy,
        message: this.i18n.translate('users.activated'),
      });
    } catch (error: any) {
      this.logger.error(`Failed to notify user:activated: ${error.message}`);
    }
  }

  // Internal method called by the controller when a user is deactivated
  notifyUserDeactivated(user: any, deactivatedBy: string): void {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized, skipping user:deactivated notification');
      return;
    }
    try {
      this.server.emit('user:deactivated', {
        id: user._id || user.id,
        username: user.username,
        status: user.status,
        deactivatedBy,
        message: this.i18n.translate('users.deactivated'),
      });
    } catch (error: any) {
      this.logger.error(`Failed to notify user:deactivated: ${error.message}`);
    }
  }
}
