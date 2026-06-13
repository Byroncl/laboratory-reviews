import { ApiProperty } from '@nestjs/swagger';
import { CommentResponseDto } from './comment-response.dto';

export class CommentTreeNodeDto extends CommentResponseDto {
  @ApiProperty({
    description: 'Child comments (replies)',
    required: false,
  })
  replies?: CommentTreeNodeDto[];

  @ApiProperty({
    example: 3,
    description: 'Total count of child comments',
    required: false,
  })
  replyCount?: number;
}

export class CommentThreadDto {
  @ApiProperty({
    type: CommentTreeNodeDto,
    description: 'Root comment with nested replies',
  })
  root: CommentTreeNodeDto;

  @ApiProperty({
    example: 12,
    description: 'Total comments in thread (root + all nested)',
  })
  totalInThread: number;
}
