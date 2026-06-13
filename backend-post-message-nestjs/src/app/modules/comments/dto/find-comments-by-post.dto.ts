import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';

export class FindCommentsByPostDto {
  @IsMongoId()
  @IsNotEmpty()
  postId: MongooseSchema.Types.ObjectId;
}
