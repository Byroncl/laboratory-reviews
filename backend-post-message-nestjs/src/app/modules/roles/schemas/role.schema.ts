import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Permission } from '../../permissions/schemas/permission.schema';

@Schema({
  timestamps: true,
  collection: 'roles',
})
export class Role extends Document {
  @Prop({ unique: true, required: true, trim: true, index: true })
  name: string;

  @Prop({ unique: true, required: true, trim: true, index: true })
  identifier: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Permission' }] })
  permissions: Permission[];

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
