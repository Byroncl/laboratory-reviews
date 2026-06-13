import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'My First Post', description: 'Title of the post' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'This is the post content.', description: 'Body content of the post' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    example: 'http://localhost:9000/posts/1718000000000-photo.jpg',
    description: 'URL of the post image (obtained from POST /files/upload)',
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({
    example: '1718000000000-photo.jpg',
    description: 'MinIO filename for the post image (used for deletion)',
  })
  @IsOptional()
  @IsString()
  imageFilename?: string;
}
