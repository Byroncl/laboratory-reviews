import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({
  timestamps: true,
  collection: 'comments',
})
export class Comment {
  @Prop({ type: String, required: true, index: true })
  postId: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  mediaUrls: string[];

  @Prop({ type: [String], default: [] })
  mediaTypes: string[];

  @Prop({ type: [String], default: [] })
  mediaFilenames: string[];

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ type: String, default: null })
  parentCommentId?: string;

  @Prop({ type: [String], default: [] })
  childCommentIds: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.index({ postId: 1 });
CommentSchema.index({ userId: 1 });
CommentSchema.index({ postId: 1, parentCommentId: 1 });
CommentSchema.index({ parentCommentId: 1 });
