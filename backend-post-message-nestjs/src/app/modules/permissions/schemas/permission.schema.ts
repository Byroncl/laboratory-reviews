import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Permission extends Document {
  @Prop({ unique: true, required: true, trim: true })
  name: string;

  @Prop({ unique: true, required: true, trim: true })
  identifier: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
