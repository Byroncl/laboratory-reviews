import { IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindCommentsByPostDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID of the post to filter comments by' })
  @IsMongoId()
  @IsNotEmpty()
  postId: string;
}
