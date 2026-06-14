import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateNotificationDto } from './create-notification.dto';
import { NotificationType } from '../schemas/notification.schema';

describe('CreateNotificationDto', () => {
  function buildValid(): CreateNotificationDto {
    return plainToInstance(CreateNotificationDto, {
      userId: 'user-1',
      type: NotificationType.COMMENT_CREATED,
      actorId: 'actor-1',
      actorName: 'alice',
      postId: 'post-1',
      message: 'alice commented on your post',
    });
  }

  it('should pass validation with all required fields', async () => {
    const dto = buildValid();
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when userId is missing', async () => {
    const dto = buildValid();
    (dto as any).userId = undefined;
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'userId')).toBe(true);
  });

  it('should fail when type is not a valid NotificationType', async () => {
    const dto = buildValid();
    (dto as any).type = 'invalid_type';
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'type')).toBe(true);
  });

  it('should accept valid type REPLY_CREATED', async () => {
    const dto = buildValid();
    dto.type = NotificationType.REPLY_CREATED;
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should accept optional fields commentId, parentCommentId, emoji', async () => {
    const dto = buildValid();
    dto.commentId = 'comment-1';
    dto.parentCommentId = 'parent-1';
    dto.emoji = '👍';
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass without optional fields', async () => {
    const dto = buildValid();
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.commentId).toBeUndefined();
    expect(dto.emoji).toBeUndefined();
  });
});
