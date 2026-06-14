import { ApiProperty } from '@nestjs/swagger';

export class ReactionCountDto {
  @ApiProperty({ example: '👍' })
  emoji: string;

  @ApiProperty({ example: 5 })
  count: number;

  @ApiProperty({
    type: [String],
    example: ['user-1', 'user-2', 'user-3'],
    description: 'List of user IDs who reacted with this emoji',
  })
  users: string[];
}

export class ReactionResponseDto {
  @ApiProperty({ example: 'comment-id-123' })
  commentId: string;

  @ApiProperty({
    type: [ReactionCountDto],
    description: 'Array of reactions grouped by emoji',
  })
  reactions: ReactionCountDto[];

  @ApiProperty({
    example: 8,
    description: 'Total reaction count',
  })
  total: number;

  @ApiProperty({
    example: false,
    description: 'Whether current user has already reacted',
  })
  userReacted: boolean;

  @ApiProperty({
    example: '👍',
    description: 'Current user reaction emoji (if reacted)',
    required: false,
  })
  userReaction?: string | null;
}
