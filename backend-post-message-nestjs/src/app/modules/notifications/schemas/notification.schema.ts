import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  COMMENT_CREATED = 'comment_created',
  REPLY_CREATED = 'reply_created',
  REACTION_ADDED = 'reaction_added',
  USER_JOINED = 'user_joined',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ type: String, required: true })
  actorId: string;

  @Prop({ type: String, required: true })
  actorName: string;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: String })
  commentId?: string;

  @Prop({ type: String })
  parentCommentId?: string;

  @Prop({ type: String })
  emoji?: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: Boolean, default: false })
  read: boolean;

  @Prop()
  readAt?: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ postId: 1 });
NotificationSchema.index({ commentId: 1 });
