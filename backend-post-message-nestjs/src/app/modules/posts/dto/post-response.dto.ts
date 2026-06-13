import { ApiProperty } from '@nestjs/swagger';

export class PostResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Post ID' })
  id: string;

  @ApiProperty({ example: 'My First Post', description: 'Post title' })
  title: string;

  @ApiProperty({ example: 'This is the post content.', description: 'Post body content' })
  content: string;

  @ApiProperty({ example: true, description: 'Whether the post is active' })
  isActive: boolean;
}
