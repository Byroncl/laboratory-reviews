import { ApiProperty } from '@nestjs/swagger';

export class CommentMediaDto {
  @ApiProperty({ example: 'http://localhost:9000/posts/image.jpg' })
  url: string;

  @ApiProperty({ example: 'image/jpeg' })
  type: string;

  @ApiProperty({ example: 'photo.jpg' })
  filename: string;
}

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

  @ApiProperty({
    type: [CommentMediaDto],
    description: 'Array of attached media (images and audios)',
  })
  media: CommentMediaDto[];
}
