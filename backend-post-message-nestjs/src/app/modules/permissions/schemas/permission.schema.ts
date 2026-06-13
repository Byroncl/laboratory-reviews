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

@Schema({
  timestamps: true,
  collection: 'permissions',
})
export class Permission extends Document {
  @Prop({ unique: true, required: true, trim: true, index: true })
  name: string;

  @Prop({ unique: true, required: true, trim: true, index: true })
  identifier: string;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ type: String, enum: Object.values(PermissionType), index: true })
  type: PermissionType;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
