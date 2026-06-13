import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReactionDocument = Reaction & Document;

export const ALLOWED_EMOJI_VALUES = ['👍', '❤️', '😂', '😮', '😢', '😡'] as const;
export type AllowedEmoji = (typeof ALLOWED_EMOJI_VALUES)[number];

@Schema({ timestamps: true })
export class Reaction {
  @Prop({ type: String, required: true })
  commentId: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ required: true, enum: ALLOWED_EMOJI_VALUES })
  emoji: string;

  @Prop()
  createdAt: Date;
}

export const ReactionSchema = SchemaFactory.createForClass(Reaction);
ReactionSchema.index({ commentId: 1, userId: 1, emoji: 1 }, { unique: true });
ReactionSchema.index({ commentId: 1 });
