import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class FindCommentsByPostDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID of the post to filter comments by' })
  @IsMongoId()
  @IsNotEmpty()
  postId: MongooseSchema.Types.ObjectId;
}
