import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PostResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Post ID' })
  id: string;

  @ApiProperty({ example: 'My First Post', description: 'Post title' })
  title: string;

  @ApiProperty({ example: 'This is the post content.', description: 'Post body content' })
  content: string;

  @ApiProperty({ example: true, description: 'Whether the post is active' })
  isActive: boolean;

  @ApiPropertyOptional({
    example: 'http://localhost:9000/posts/1718000000000-photo.jpg',
    description: 'URL of the post image',
  })
  imageUrl?: string;

  @ApiPropertyOptional({
    example: '1718000000000-photo.jpg',
    description: 'MinIO filename of the post image',
  })
  imageFilename?: string;
}
