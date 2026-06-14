import {
  NOTIFICATIONS_CONFIG,
  NOTIFICATIONS_VALIDATION_MESSAGES,
  NOTIFICATION_TYPES,
} from '../../constants/notifications.constants';
import { DomainException } from '../../../core/exceptions/app.exceptions';

export class NotificationEntity {
  readonly _id?: string;
  readonly userId: string;
  readonly type: string;
  readonly actorId: string;
  readonly actorName: string;
  readonly postId: string;
  readonly commentId?: string;
  readonly parentCommentId?: string;
  readonly emoji?: string;
  readonly message: string;
  readonly read: boolean;
  readonly readAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt?: Date;

  constructor(props: {
    _id?: string;
    userId: string;
    type: string;
    actorId: string;
    actorName: string;
    postId: string;
    commentId?: string;
    parentCommentId?: string;
    emoji?: string;
    message: string;
    read?: boolean;
    readAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.validateUserId(props.userId);
    this.validateType(props.type);
    this.validateActorId(props.actorId);
    this.validateActorName(props.actorName);
    this.validatePostId(props.postId);
    if (props.commentId) {
      this.validateCommentId(props.commentId);
    }
    if (props.parentCommentId) {
      this.validateParentCommentId(props.parentCommentId);
    }
    if (props.emoji) {
      this.validateEmoji(props.emoji);
    }
    this.validateMessage(props.message);

    this._id = props._id;
    this.userId = props.userId;
    this.type = props.type;
    this.actorId = props.actorId;
    this.actorName = props.actorName;
    this.postId = props.postId;
    this.commentId = props.commentId;
    this.parentCommentId = props.parentCommentId;
    this.emoji = props.emoji;
    this.message = props.message;
    this.read = props.read ?? false;
    this.readAt = props.readAt;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt;
  }

  private validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string') {
      throw new DomainException(NOTIFICATIONS_VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }
  }

  private validateType(type: string): void {
    if (!type || typeof type !== 'string') {
      throw new DomainException(NOTIFICATIONS_VALIDATION_MESSAGES.TYPE_REQUIRED);
    }
    const validTypes = Object.values(NOTIFICATION_TYPES);
    if (!validTypes.includes(type)) {
      throw new DomainException(NOTIFICATIONS_VALIDATION_MESSAGES.TYPE_INVALID);
    }
  }

  private validateActorId(actorId: string): void {
    if (!actorId || typeof actorId !== 'string') {
      throw new DomainException(NOTIFICATIONS_VALIDATION_MESSAGES.ACTOR_ID_REQUIRED);
    }
  }

  private validateActorName(actorName: string): void {
    if (!actorName || typeof actorName !== 'string') {
      throw new DomainException(NOTIFICATIONS_VALIDATION_MESSAGES.ACTOR_NAME_REQUIRED);
    }
  }

  private validatePostId(postId: string): void {
    if (!postId || typeof postId !== 'string') {
      throw new DomainException(NOTIFICATIONS_VALIDATION_MESSAGES.POST_ID_REQUIRED);
    }
  }

  private validateCommentId(commentId: string): void {
    if (!commentId || typeof commentId !== 'string') {
      throw new DomainException(NOTIFICATIONS_VALIDATION_MESSAGES.COMMENT_ID_INVALID);
    }
  }

  private validateParentCommentId(parentCommentId: string): void {
    if (!parentCommentId || typeof parentCommentId !== 'string') {
      throw new DomainException(NOTIFICATIONS_VALIDATION_MESSAGES.PARENT_COMMENT_ID_INVALID);
    }
  }

  private validateEmoji(emoji: string): void {
    if (!emoji || typeof emoji !== 'string') {
      throw new DomainException(NOTIFICATIONS_VALIDATION_MESSAGES.EMOJI_INVALID);
    }
  }

  private validateMessage(message: string): void {
    if (!message || typeof message !== 'string') {
      throw new DomainException(NOTIFICATIONS_VALIDATION_MESSAGES.MESSAGE_REQUIRED);
    }
    if (message.length > NOTIFICATIONS_CONFIG.MESSAGE_MAX_LENGTH) {
      throw new DomainException(NOTIFICATIONS_VALIDATION_MESSAGES.MESSAGE_MAX_LENGTH);
    }
  }

  markAsRead(): NotificationEntity {
    return new NotificationEntity({
      _id: this._id,
      userId: this.userId,
      type: this.type,
      actorId: this.actorId,
      actorName: this.actorName,
      postId: this.postId,
      commentId: this.commentId,
      parentCommentId: this.parentCommentId,
      emoji: this.emoji,
      message: this.message,
      read: true,
      readAt: new Date(),
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  markAsUnread(): NotificationEntity {
    return new NotificationEntity({
      _id: this._id,
      userId: this.userId,
      type: this.type,
      actorId: this.actorId,
      actorName: this.actorName,
      postId: this.postId,
      commentId: this.commentId,
      parentCommentId: this.parentCommentId,
      emoji: this.emoji,
      message: this.message,
      read: false,
      readAt: undefined,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  isRead(): boolean {
    return this.read;
  }

  isUnread(): boolean {
    return !this.read;
  }

  isCommentNotification(): boolean {
    return this.type === NOTIFICATION_TYPES.COMMENT_CREATED;
  }

  isReplyNotification(): boolean {
    return this.type === NOTIFICATION_TYPES.REPLY_CREATED;
  }

  isReactionNotification(): boolean {
    return this.type === NOTIFICATION_TYPES.REACTION_ADDED;
  }
}
