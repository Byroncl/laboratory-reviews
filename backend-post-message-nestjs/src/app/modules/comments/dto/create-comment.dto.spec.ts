import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateCommentDto } from './create-comment.dto';

describe('CreateCommentDto', () => {
  const validPayload = {
    content: 'Great post!',
    post: '507f1f77bcf86cd799439011',
  };

  it('should pass with required fields', async () => {
    const dto = plainToInstance(CreateCommentDto, validPayload);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject an empty content', async () => {
    const dto = plainToInstance(CreateCommentDto, { ...validPayload, content: '' });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'content')).toBeDefined();
  });

  it('should reject an invalid mongo id for post', async () => {
    const dto = plainToInstance(CreateCommentDto, { ...validPayload, post: 'not-a-mongo-id' });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'post')).toBeDefined();
  });

  it('should trim content via Transform', async () => {
    const dto = plainToInstance(CreateCommentDto, { ...validPayload, content: '  Great post!  ' });
    expect(dto.content).toBe('Great post!');
  });
});
