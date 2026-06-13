import { ApiProperty } from '@nestjs/swagger';

export class CommentResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Comment ID' })
  id: string;

  @ApiProperty({ example: 'Great post!', description: 'Comment content' })
  content: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'ID of the post' })
  post: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439013', description: 'ID of the previous comment (threading)', required: false })
  previousComment?: string;

  @ApiProperty({ example: true, description: 'Whether the comment is active' })
  isActive: boolean;
}
