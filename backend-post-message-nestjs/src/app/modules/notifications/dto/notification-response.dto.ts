import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../schemas/notification.schema';

export class NotificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty({ example: 'user-1' })
  actorId: string;

  @ApiProperty({ example: 'john_doe' })
  actorName: string;

  @ApiProperty()
  postId: string;

  @ApiProperty({ example: 'comment-123', required: false })
  commentId?: string;

  @ApiProperty({ example: 'parent-comment-456', required: false })
  parentCommentId?: string;

  @ApiProperty({ example: '👍', required: false })
  emoji?: string;

  @ApiProperty({ example: 'john_doe commented on your post' })
  message: string;

  @ApiProperty()
  read: boolean;

  @ApiProperty({ example: '2026-06-13T10:30:00Z', required: false })
  readAt?: Date;

  @ApiProperty()
  createdAt: Date;
}
