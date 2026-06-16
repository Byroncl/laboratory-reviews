import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { TranslationService } from '../../../core/utils/translation.service';

@WebSocketGateway({
  namespace: 'roles',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class RolesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RolesGateway.name);
  private connectedUsers = new Map<string, { userId: string; username: string }>();

  constructor(
    private readonly rolesService: RolesService,
    private readonly i18n: TranslationService,
  ) {}

  handleConnection = (client: Socket): void => {
    this.logger.log(`Client connected: ${client.id}`);
    if (this.server) {
      this.server.emit('user:connected', {
        clientId: client.id,
        totalConnected: this.connectedUsers.size + 1,
      });
    }
  };

  handleDisconnect = (client: Socket): void => {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedUsers.delete(client.id);
    if (this.server) {
      this.server.emit('user:disconnected', {
        clientId: client.id,
        totalConnected: this.connectedUsers.size,
      });
    }
  };

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

  @SubscribeMessage('roles:list')
  async handleRolesList(client: Socket): Promise<void> {
    try {
      const roles = await this.rolesService.findAll();
      client.emit('roles:list:success', {
        roles,
        total: roles.length,
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

  // Internal method called by the controller when a role is created
  notifyRoleCreated(role: any, createdBy: string): void {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized for role:created notification');
      return;
    }
    this.server.emit('role:created', {
      id: role._id || role.id,
      name: role.name,
      description: role.description,
      createdBy,
      createdAt: role.createdAt,
      message: this.i18n.translate('roles.created'),
    });
  }

  // Internal method called by the controller when a role is updated
  notifyRoleUpdated(role: any, updatedBy: string): void {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized for role:updated notification');
      return;
    }
    this.server.emit('role:updated', {
      id: role._id || role.id,
      name: role.name,
      description: role.description,
      updatedBy,
      updatedAt: role.updatedAt,
      message: this.i18n.translate('roles.updated'),
    });
  }

  // Internal method called by the controller when a role is deleted
  notifyRoleDeleted(roleId: string, deletedBy: string): void {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized for role:deleted notification');
      return;
    }
    this.server.emit('role:deleted', {
      id: roleId,
      deletedBy,
      message: this.i18n.translate('roles.deleted'),
    });
  }
}
