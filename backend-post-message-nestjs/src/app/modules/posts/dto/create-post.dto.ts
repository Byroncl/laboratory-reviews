import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  MinLength,
  MaxLength,
  IsMongoId,
  IsEnum,
  IsArray,
  ArrayMaxSize,
  ArrayUnique,
  ValidateIf,
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

  @ApiPropertyOptional({
    example: 'dawd',
    description: 'Author of the post',
  })
  @IsOptional()
  @IsString({ message: 'Author must be a string' })
  @Transform(({ value }: { value: string }) => value?.trim())
  author?: string;

  @ApiProperty({
    example: 'This is the post content.',
    description: 'Body content of the post (1-5000 characters)',
    minLength: 1,
    maxLength: 5000,
  })
  @ValidateIf((o: any) => !o.body || o.content !== undefined)
  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  @MinLength(1, { message: 'Content cannot be empty' })
  @MaxLength(5000, { message: 'Content must not exceed 5000 characters' })
  @Transform(({ value, obj }: { value: string; obj: any }) => (value || obj.body)?.trim())
  content?: string;

  @ApiPropertyOptional({
    example: 'This is the post content.',
    description: 'Alias for content (saved in database as body)',
    minLength: 1,
    maxLength: 5000,
  })
  @ValidateIf((o: any) => !o.content || o.body !== undefined)
  @IsString({ message: 'Body must be a string' })
  @IsNotEmpty({ message: 'Body is required' })
  @MinLength(1, { message: 'Body cannot be empty' })
  @MaxLength(5000, { message: 'Body must not exceed 5000 characters' })
  @Transform(({ value, obj }: { value: string; obj: any }) => (value || obj.content)?.trim())
  body?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'Image URL must be a valid URL with protocol' })
  imageUrl?: string;

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

  @ApiPropertyOptional({
    example: 'draft',
    description: 'Post status',
    enum: ['draft', 'published', 'archived'],
  })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'], {
    message: 'Status must be one of: draft, published, archived',
  })
  status?: string;

  @ApiPropertyOptional({
    example: ['nestjs', 'typescript'],
    description: 'Post tags (max 10, each max 30 characters)',
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @ArrayMaxSize(10, { message: 'Tags must not exceed 10 items' })
  @ArrayUnique({ message: 'Tags must be unique' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @MaxLength(30, { each: true, message: 'Each tag must not exceed 30 characters' })
  tags?: string[];
}
