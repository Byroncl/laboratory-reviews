import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'My First Post', description: 'Title of the post' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  @Transform(({ value }: { value: string }) => value?.trim())
  title: string;

  @ApiProperty({ example: 'This is the post content.', description: 'Body content of the post' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  @Transform(({ value }: { value: string }) => value?.trim())
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
  @MaxLength(500)
  imageFilename?: string;

  @ApiPropertyOptional({
    example: '507f1f77bcf86cd799439011',
    description: 'MongoDB ObjectId of the category',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 'Backend',
    description: 'Denormalized category name for quick display',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  categoryName?: string;
}
