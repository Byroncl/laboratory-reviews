import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../../roles/schemas/role.schema';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  collection: 'users',
})
export class User extends Document {
  @Prop({ required: true, minlength: 2, maxlength: 50 })
  name: string;

  @Prop({ required: true, minlength: 2, maxlength: 50 })
  lastname: string;

  @Prop({ required: true, unique: true, minlength: 3, maxlength: 20, index: true })
  username: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password_hash: string;

  @Prop({ required: true })
  type: string;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ required: false })
  password?: string;

  @Prop({ type: Types.ObjectId, ref: 'Role' })
  role: Role;

  @Prop({ enum: ['en', 'es'], default: 'en' })
  preferredLanguage?: 'en' | 'es';

  @Prop({ default: false })
  isDeleted: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
