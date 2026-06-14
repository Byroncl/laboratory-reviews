import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  MinLength,
  MaxLength,
  IsMongoId,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    example: 'My First Post',
    description: 'Title of the post (3-200 characters)',
    minLength: 3,
    maxLength: 200,
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  title: string;

  @ApiProperty({
    example: 'This is the post content.',
    description: 'Body content of the post (1-5000 characters)',
    minLength: 1,
    maxLength: 5000,
  })
  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  @MinLength(1, { message: 'Content cannot be empty' })
  @MaxLength(5000, { message: 'Content must not exceed 5000 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  content: string;

  @ApiPropertyOptional({
    example: 'http://localhost:9000/posts/1718000000000-photo.jpg',
    description: 'Valid URL of the post image (from POST /files/upload)',
  })
  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'Image URL must be a valid URL with protocol' })
  imageUrl?: string;

  @ApiPropertyOptional({
    example: '1718000000000-photo.jpg',
    description: 'MinIO filename for the post image (1-500 characters)',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Image filename must be a string' })
  @MaxLength(500, { message: 'Image filename must not exceed 500 characters' })
  imageFilename?: string;

  @ApiPropertyOptional({
    example: '507f1f77bcf86cd799439011',
    description: 'Valid MongoDB ObjectId of the category',
  })
  @IsOptional()
  @IsMongoId({ message: 'Category ID must be a valid MongoDB ObjectId' })
  categoryId?: string;

  @ApiPropertyOptional({
    example: 'Backend',
    description: 'Denormalized category name (1-100 characters)',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Category name must be a string' })
  @MinLength(1, { message: 'Category name cannot be empty' })
  @MaxLength(100, { message: 'Category name must not exceed 100 characters' })
  categoryName?: string;
}
