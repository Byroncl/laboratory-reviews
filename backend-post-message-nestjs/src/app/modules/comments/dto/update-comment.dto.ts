import { PartialType } from '@nestjs/swagger';
import { CreateCommentDto } from './create-comment.dto';
import {
  IsOptional,
  IsArray,
  IsUrl,
  IsString,
  MinLength,
  MaxLength,
  ArrayMinSize,
  ArrayMaxSize,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
  @ApiProperty({
    example: 'Great post!',
    description: 'Updated comment content (1-2000 characters)',
    minLength: 1,
    maxLength: 2000,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Content must be a string' })
  @MinLength(1, { message: 'Comment content cannot be empty' })
  @MaxLength(2000, { message: 'Comment content must not exceed 2000 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  content?: string;

  @ApiProperty({
    type: [String],
    example: ['/uploads/image1.jpg'],
    description: 'Updated media URLs or paths (0-10 URLs)',
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
    example: ['image/jpeg'],
    description: 'Updated MIME types (0-10 types)',
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
    example: ['photo.jpg'],
    description: 'Updated media filenames (0-10 filenames)',
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
