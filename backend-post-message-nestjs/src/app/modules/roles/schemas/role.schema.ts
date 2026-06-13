import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Permission } from '../../permissions/schemas/permission.schema';

@Schema({ timestamps: true })
export class Role extends Document {
  @Prop({ unique: true, required: true, trim: true })
  name: string;

  @Prop({ unique: true, required: true, trim: true })
  identifier: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Permission' }] })
  permissions: Permission[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
