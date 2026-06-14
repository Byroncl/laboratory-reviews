import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({
  timestamps: true,
  collection: 'posts',
})
export class Post {
  @Prop({ required: true, minlength: 3, maxlength: 200, index: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ required: true, index: true })
  author: string;

  @Prop({ type: Types.ObjectId, ref: 'Client', required: false, index: true })
  authorId?: Types.ObjectId;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ required: false })
  imageUrl?: string;

  @Prop({ required: false })
  imageFilename?: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: false, index: true })
  categoryId?: Types.ObjectId;

  @Prop({ type: String, required: false })
  categoryName?: string;

  @Prop({
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  })
  status?: string;

  @Prop({ type: [String], default: [] })
  tags?: string[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.index({ categoryId: 1 });
