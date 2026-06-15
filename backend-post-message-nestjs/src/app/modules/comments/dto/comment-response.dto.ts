import { ApiProperty } from '@nestjs/swagger';

export class CommentMediaDto {
  @ApiProperty({ example: 'http://localhost:9000/posts/image.jpg' })
  url: string;

  @ApiProperty({ example: 'image/jpeg' })
  type: string;

  @ApiProperty({ example: 'photo.jpg' })
  filename: string;
}

export class ReactionCountDto {
  @ApiProperty({ example: '👍' })
  emoji: string;

  @ApiProperty({ example: 5 })
  count: number;

  @ApiProperty({
    type: [String],
    example: ['user-1', 'user-2', 'user-3'],
  })
  users: string[];
}

export class CommentResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Comment ID' })
  id: string;

  @ApiProperty({ example: 'Great post!', description: 'Comment content' })
  content: string;

  @ApiProperty({ example: 'byron', description: 'Author of the comment', required: false })
  author?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'ID of the post' })
  postId: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439013', description: 'ID of the previous comment (threading)', required: false })
  previousComment?: string;

  @ApiProperty({ example: true, description: 'Whether the comment is active' })
  isActive: boolean;

  @ApiProperty({
    type: [CommentMediaDto],
    description: 'Array of attached media (images and audios)',
  })
  media: CommentMediaDto[];

  @ApiProperty({
    example: null,
    description: 'Parent comment ID (null for root comments)',
    required: false,
  })
  parentCommentId?: string;

  @ApiProperty({
    type: [String],
    description: 'Array of direct reply comment IDs',
    example: [],
  })
  childCommentIds?: string[];

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Creation timestamp', required: false })
  createdAt?: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Last update timestamp', required: false })
  updatedAt?: Date;

  @ApiProperty({
    type: [ReactionCountDto],
    description: 'Reactions on this comment (when includeReactions=true)',
    required: false,
  })
  reactions?: ReactionCountDto[];
}
