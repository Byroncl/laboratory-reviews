import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  MinLength,
  MaxLength,
  IsArray,
  IsUrl,
  ArrayMinSize,
  ArrayMaxSize,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    example: 'Great post!',
    description: 'Comment content (1-2000 characters)',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Comment content is required' })
  @MinLength(1, { message: 'Comment content cannot be empty' })
  @MaxLength(2000, { message: 'Comment content must not exceed 2000 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  content: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Valid MongoDB ObjectId of the post',
  })
  @IsMongoId({ message: 'Post ID must be a valid MongoDB ObjectId' })
  @IsNotEmpty({ message: 'Post ID is required' })
  postId: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439013',
    description: 'User ID of the comment author',
  })
  @IsString({ message: 'User ID must be a string' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @ApiProperty({
    example: 'john_doe',
    description: 'Username of the comment author',
  })
  @IsString({ message: 'Author name must be a string' })
  @IsNotEmpty({ message: 'Author name is required' })
  author: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439012',
    description: 'Valid MongoDB ObjectId of the previous comment (for threading)',
    required: false,
  })
  @IsMongoId({ message: 'Previous comment ID must be a valid MongoDB ObjectId' })
  @IsOptional()
  previousComment?: string;

  @ApiProperty({
    example: null,
    description: 'Valid MongoDB ObjectId of parent comment (null for root comments)',
    required: false,
  })
  @IsOptional()
  @IsMongoId({ message: 'Parent comment ID must be a valid MongoDB ObjectId' })
  parentCommentId?: string;

  @ApiProperty({
    type: [String],
    example: [
      '/uploads/image1.jpg',
      '/uploads/audio1.mp3',
    ],
    description: 'Array of media URLs or paths (0-10 URLs)',
    required: false,
    minItems: 0,
    maxItems: 10,
  })
  @IsOptional()
  @IsArray({ message: 'Media URLs must be an array' })
  @ArrayMinSize(0, { message: 'Media URLs array must have at least 0 items' })
  @ArrayMaxSize(10, { message: 'Media URLs array must not exceed 10 items' })
  @IsString({ each: true, message: 'Each media URL must be a string' })
  mediaUrls?: string[];

  @ApiProperty({
    type: [String],
    example: ['image/jpeg', 'audio/mpeg'],
    description: 'Array of MIME types corresponding to media (0-10 types)',
    required: false,
    minItems: 0,
    maxItems: 10,
  })
  @IsOptional()
  @IsArray({ message: 'Media types must be an array' })
  @ArrayMinSize(0, { message: 'Media types array must have at least 0 items' })
  @ArrayMaxSize(10, { message: 'Media types array must not exceed 10 items' })
  @IsString({ each: true, message: 'Each media type must be a string' })
  @Matches(/^[a-zA-Z0-9\-+.\/]+$/, {
    each: true,
    message: 'Each media type must be a valid MIME type (e.g., image/jpeg)',
  })
  mediaTypes?: string[];

  @ApiProperty({
    type: [String],
    example: ['photo.jpg', 'recording.mp3'],
    description: 'Array of media filenames (0-10 filenames)',
    required: false,
    minItems: 0,
    maxItems: 10,
  })
  @IsOptional()
  @IsArray({ message: 'Media filenames must be an array' })
  @ArrayMinSize(0, { message: 'Media filenames array must have at least 0 items' })
  @ArrayMaxSize(10, { message: 'Media filenames array must not exceed 10 items' })
  @IsString({ each: true, message: 'Each media filename must be a string' })
  @MaxLength(500, { each: true, message: 'Each filename must not exceed 500 characters' })
  mediaFilenames?: string[];
}
