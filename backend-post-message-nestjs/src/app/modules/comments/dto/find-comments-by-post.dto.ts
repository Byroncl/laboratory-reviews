import { IsMongoId, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FindCommentsByPostDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID of the post to filter comments by' })
  @IsMongoId()
  @IsNotEmpty()
  postId: string;

  @ApiProperty({ example: true, description: 'Include reactions for each comment', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeReactions?: boolean;
}
