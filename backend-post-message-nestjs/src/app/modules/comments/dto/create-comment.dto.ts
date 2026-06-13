import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';

import { IsString, IsNotEmpty, IsMongoId, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsMongoId()
  @IsNotEmpty()
  post: string;

  @IsMongoId()
  @IsOptional()
  previousComment?: string;
}
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
