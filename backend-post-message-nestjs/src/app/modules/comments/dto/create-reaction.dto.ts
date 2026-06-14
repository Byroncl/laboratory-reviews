import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ALLOWED_EMOJI_VALUES } from '../schemas/reaction.schema';

export const ALLOWED_EMOJIS = [...ALLOWED_EMOJI_VALUES];

export class CreateReactionDto {
  @ApiProperty({
    example: 'comment-id-123',
    description: 'Comment ID to react to',
  })
  @IsNotEmpty()
  @IsString()
  commentId: string;

  @ApiProperty({
    enum: ALLOWED_EMOJIS,
    example: '👍',
    description: 'Emoji reaction',
  })
  @IsNotEmpty()
  @IsEnum(ALLOWED_EMOJIS)
  emoji: string;

  @ApiProperty({
    example: 'user-id-456',
    description: 'User ID (auto-filled from auth)',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;
}
