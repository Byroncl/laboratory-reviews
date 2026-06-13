import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';

export class CreateCommentDto {
  @IsMongoId()
  @IsNotEmpty()
  postId: MongooseSchema.Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}
