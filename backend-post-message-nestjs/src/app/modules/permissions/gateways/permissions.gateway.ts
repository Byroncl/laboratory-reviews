import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PermissionsService } from '../services/permissions.service';
import { TranslationService } from '../../../core/utils/translation.service';

@WebSocketGateway({
  namespace: 'permissions',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class PermissionsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PermissionsGateway.name);
  private connectedUsers = new Map<string, { userId: string; username: string }>();

  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly i18n: TranslationService,
  ) {}

  handleConnection = (client: Socket): void => {
    this.logger.log(`Client connected: ${client.id}`);
    this.server.emit('user:connected', {
      clientId: client.id,
      totalConnected: this.connectedUsers.size + 1,
    });
  };

  handleDisconnect = (client: Socket): void => {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedUsers.delete(client.id);
    this.server.emit('user:disconnected', {
      clientId: client.id,
      totalConnected: this.connectedUsers.size,
    });
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

  @SubscribeMessage('permissions:list')
  async handlePermissionsList(client: Socket): Promise<void> {
    try {
      const permissions = await this.permissionsService.findAll();
      client.emit('permissions:list:success', {
        permissions,
        total: permissions.length,
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

  // Internal method called by the controller when a permission is created
  notifyPermissionCreated(permission: any, createdBy: string): void {
    this.server.emit('permission:created', {
      id: permission._id || permission.id,
      name: permission.name,
      description: permission.description,
      createdBy,
      createdAt: permission.createdAt,
      message: this.i18n.translate('permissions.created'),
    });
  }

  // Internal method called by the controller when a permission is updated
  notifyPermissionUpdated(permission: any, updatedBy: string): void {
    this.server.emit('permission:updated', {
      id: permission._id || permission.id,
      name: permission.name,
      description: permission.description,
      updatedBy,
      updatedAt: permission.updatedAt,
      message: this.i18n.translate('permissions.updated'),
    });
  }

  // Internal method called by the controller when a permission is deleted
  notifyPermissionDeleted(permissionId: string, deletedBy: string): void {
    this.server.emit('permission:deleted', {
      id: permissionId,
      deletedBy,
      message: this.i18n.translate('permissions.deleted'),
    });
  }
}
