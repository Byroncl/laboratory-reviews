import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  MinLength,
  MaxLength,
  IsArray,
  IsUrl,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'Great post!', description: 'Comment content' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  @Transform(({ value }: { value: string }) => value?.trim())
  content: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID of the post this comment belongs to',
  })
  @IsMongoId()
  @IsNotEmpty()
  post: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439012',
    description: 'ID of the previous comment (for threading)',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  previousComment?: string;

  @ApiProperty({
    example: null,
    description:
      'Parent comment ID if replying to a comment (null for root comments)',
    required: false,
  })
  @IsOptional()
  @IsString()
  parentCommentId?: string;

  @ApiProperty({
    type: [String],
    example: [
      'http://localhost:9000/posts/image1.jpg',
      'http://localhost:9000/posts/audio1.mp3',
    ],
    description: 'Array of media URLs (from file upload)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUrl({ require_tld: false }, { each: true })
  mediaUrls?: string[];

  @ApiProperty({
    type: [String],
    example: ['image/jpeg', 'audio/mpeg'],
    description: 'Array of MIME types corresponding to media',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaTypes?: string[];

  @ApiProperty({
    type: [String],
    example: ['photo.jpg', 'recording.mp3'],
    description: 'Array of media filenames',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaFilenames?: string[];
}
