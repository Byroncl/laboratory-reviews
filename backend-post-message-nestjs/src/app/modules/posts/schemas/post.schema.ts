import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ required: true })
  author: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: false })
  imageUrl?: string;

  @Prop({ required: false })
  imageFilename?: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);
