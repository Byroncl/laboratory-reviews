import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum PermissionType {
  USER = 'user',
  ROLES = 'roles',
  PERMISSIONS = 'permissions',
  COMMENTS = 'comments',
  CLIENTS = 'clients',
  STATISTICS = 'statistics',
  AUDITS = 'audits',
}

@Schema({ timestamps: true })
export class Permission extends Document {
  @Prop({ unique: true, required: true, trim: true })
  name: string;

  @Prop({ unique: true, required: true, trim: true })
  identifier: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String, enum: Object.values(PermissionType) })
  type: PermissionType;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
