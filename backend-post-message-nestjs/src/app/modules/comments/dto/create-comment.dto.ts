import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  MinLength,
  MaxLength,
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

  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID of the post this comment belongs to' })
  @IsMongoId()
  @IsNotEmpty()
  post: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'ID of the previous comment (for threading)', required: false })
  @IsMongoId()
  @IsOptional()
  previousComment?: string;
}
