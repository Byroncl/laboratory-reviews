import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { NotificationType } from '../schemas/notification.schema';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsNotEmpty()
  @IsString()
  actorId: string;

  @IsNotEmpty()
  @IsString()
  actorName: string;

  @IsNotEmpty()
  @IsString()
  postId: string;

  @IsOptional()
  @IsString()
  commentId?: string;

  @IsOptional()
  @IsString()
  parentCommentId?: string;

  @IsOptional()
  @IsString()
  emoji?: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}
