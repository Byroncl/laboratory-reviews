import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { CommentsService } from '../services/comments.service';
import { ReactionsService } from '../services/reactions.service';
import { TranslationService } from '../../../core/utils/translation.service';

@WebSocketGateway({
  namespace: 'comments',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class CommentsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CommentsGateway.name);
  private connectedUsers = new Map<
    string,
    { userId: string; username: string }
  >();

  constructor(
    private readonly commentsService: CommentsService,
    private readonly reactionsService: ReactionsService,
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

    this.server.emit('user:joined', {
      userId: data.userId,
      username: data.username,
      message: this.i18n.translate('comments.user_joined', undefined, data.username),
    });
  }

  @SubscribeMessage('comment:create')
  async handleCommentCreate(client: Socket, data: any): Promise<void> {
    try {
      const user = this.connectedUsers.get(client.id);
      if (!user) {
        client.emit('error', {
          message: this.i18n.translate('auth.unauthorized'),
        });
        return;
      }

      const comment = await this.commentsService.create(data);
      const commentWithMedia = this.commentsService.getCommentWithMedia(comment as any);

      this.server.emit('comment:created', {
        id: (comment as any)._id,
        postId: (comment as any).postId,
        userId: (comment as any).userId,
        content: (comment as any).content,
        media: commentWithMedia.media,
        username: user.username,
        createdAt: (comment as any).createdAt,
        message: this.i18n.translate('comments.created'),
      });

      client.emit('comment:created:success', {
        id: (comment as any)._id,
        message: this.i18n.translate('comments.created'),
      });
    } catch (error: any) {
      client.emit('error', {
        message: this.i18n.translate('common.error'),
        error: error.message,
      });
    }
  }

  @SubscribeMessage('comment:update')
  async handleCommentUpdate(
    client: Socket,
    data: { id: string; content: string },
  ): Promise<void> {
    try {
      const user = this.connectedUsers.get(client.id);
      if (!user) {
        client.emit('error', {
          message: this.i18n.translate('auth.unauthorized'),
        });
        return;
      }

      const comment = await this.commentsService.update(data.id, {
        content: data.content,
      } as any);

      this.server.emit('comment:updated', {
        id: (comment as any)._id,
        content: (comment as any).content,
        updatedAt: (comment as any).updatedAt,
        updatedBy: user.username,
        message: this.i18n.translate('comments.updated'),
      });

      client.emit('comment:updated:success', {
        id: (comment as any)._id,
        message: this.i18n.translate('comments.updated'),
      });
    } catch (error: any) {
      client.emit('error', {
        message: this.i18n.translate('common.error'),
        error: error.message,
      });
    }
  }

  @SubscribeMessage('comment:delete')
  async handleCommentDelete(
    client: Socket,
    data: { id: string },
  ): Promise<void> {
    try {
      const user = this.connectedUsers.get(client.id);
      if (!user) {
        client.emit('error', {
          message: this.i18n.translate('auth.unauthorized'),
        });
        return;
      }

      await this.commentsService.remove(data.id);

      this.server.emit('comment:deleted', {
        id: data.id,
        deletedBy: user.username,
        message: this.i18n.translate('comments.deleted'),
      });

      client.emit('comment:deleted:success', {
        id: data.id,
        message: this.i18n.translate('comments.deleted'),
      });
    } catch (error: any) {
      client.emit('error', {
        message: this.i18n.translate('common.error'),
        error: error.message,
      });
    }
  }

  @SubscribeMessage('comments:list')
  async handleCommentsList(
    client: Socket,
    data: { postId: string },
  ): Promise<void> {
    try {
      const comments = await this.commentsService.findAll(data.postId as any);

      client.emit('comments:list:success', {
        postId: data.postId,
        comments,
        total: comments.length,
      });
    } catch (error: any) {
      client.emit('error', {
        message: this.i18n.translate('common.error'),
        error: error.message,
      });
    }
  }

  @SubscribeMessage('comment:typing')
  handleCommentTyping(
    client: Socket,
    data: { postId: string; username: string },
  ): void {
    client.broadcast.emit('comment:typing', data);
  }

  @SubscribeMessage('comment:typing:stop')
  handleCommentTypingStop(
    client: Socket,
    data: { postId: string; username: string },
  ): void {
    client.broadcast.emit('comment:typing:stop', data);
  }

  @SubscribeMessage('users:connected')
  async handleGetConnectedUsers(client: Socket): Promise<void> {
    const users = Array.from(this.connectedUsers.values());
    client.emit('users:connected:success', {
      count: users.length,
      users,
    });
  }

  // ─── Nested comments / Replies ───────────────────────────────────────────

  @SubscribeMessage('comment:reply:create')
  async handleReplyCreate(client: Socket, data: any): Promise<void> {
    try {
      const user = this.connectedUsers.get(client.id);
      if (!user) {
        client.emit('error', {
          message: this.i18n.translate('auth.unauthorized'),
        });
        return;
      }

      const reply = await this.commentsService.createReply({
        ...data,
        userId: user.userId,
      });

      const formattedReply = this.commentsService.getCommentWithMedia(reply as any);

      this.server.emit('reply:created', {
        parentCommentId: data.parentCommentId,
        reply: formattedReply,
        username: user.username,
      });

      client.emit('reply:create:success', {
        replyId: (reply as any)._id,
      });
    } catch (error: any) {
      client.emit('error', {
        message: this.i18n.translate('common.error'),
        error: error.message,
      });
    }
  }

  @SubscribeMessage('comment:thread:get')
  async handleGetThread(client: Socket, data: any): Promise<void> {
    try {
      const thread = await this.commentsService.getCommentThread(data.commentId);

      client.emit('thread:data', { thread });
    } catch (error: any) {
      client.emit('error', {
        message: this.i18n.translate('common.error'),
        error: error.message,
      });
    }
  }

  // ─── Reaction events ───────────────────────────────────────────────────────

  @SubscribeMessage('reaction:add')
  async handleReactionAdd(client: Socket, data: any): Promise<void> {
    try {
      const user = this.connectedUsers.get(client.id);
      if (!user) {
        client.emit('error', {
          message: this.i18n.translate('auth.unauthorized'),
        });
        return;
      }

      const reaction = await this.reactionsService.addReaction({
        ...data,
        userId: user.userId,
      });

      const reactionsSummary = await this.reactionsService.getReactionsByComment(
        data.commentId,
      );

      this.server.emit('reaction:added', {
        commentId: data.commentId,
        emoji: reaction.emoji,
        userId: user.userId,
        username: user.username,
        reactions: reactionsSummary,
      });

      client.emit('reaction:add:success', {
        emoji: reaction.emoji,
      });
    } catch (error: any) {
      client.emit('error', {
        message: this.i18n.translate('common.error'),
        error: error.message,
      });
    }
  }

  @SubscribeMessage('reaction:remove')
  async handleReactionRemove(client: Socket, data: any): Promise<void> {
    try {
      const user = this.connectedUsers.get(client.id);
      if (!user) {
        client.emit('error', {
          message: this.i18n.translate('auth.unauthorized'),
        });
        return;
      }

      await this.reactionsService.removeReaction(
        data.commentId,
        user.userId,
        data.emoji,
      );

      const reactionsSummary = await this.reactionsService.getReactionsByComment(
        data.commentId,
      );

      this.server.emit('reaction:removed', {
        commentId: data.commentId,
        emoji: data.emoji,
        userId: user.userId,
        username: user.username,
        reactions: reactionsSummary,
      });

      client.emit('reaction:remove:success', {
        emoji: data.emoji,
      });
    } catch (error: any) {
      client.emit('error', {
        message: this.i18n.translate('common.error'),
        error: error.message,
      });
    }
  }
}
