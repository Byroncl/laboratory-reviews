import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreatePostDto } from './create-post.dto';

describe('CreatePostDto', () => {
  const validPayload = {
    title: 'My Post',
    content: 'Some content here',
  };

  it('should pass with required fields', async () => {
    const dto = plainToInstance(CreatePostDto, validPayload);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject a title shorter than 3 characters', async () => {
    const dto = plainToInstance(CreatePostDto, { ...validPayload, title: 'ab' });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'title')).toBeDefined();
  });

  it('should reject an invalid imageUrl', async () => {
    const dto = plainToInstance(CreatePostDto, { ...validPayload, imageUrl: 'not-a-url' });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'imageUrl')).toBeDefined();
  });

  it('should trim title via Transform', async () => {
    const dto = plainToInstance(CreatePostDto, { ...validPayload, title: '  My Post  ' });
    expect(dto.title).toBe('My Post');
  });

  it('should pass with body instead of content', async () => {
    const dto = plainToInstance(CreatePostDto, {
      title: 'My Post',
      body: 'Some body content',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject when both content and body are missing', async () => {
    const dto = plainToInstance(CreatePostDto, {
      title: 'My Post',
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'content')).toBeDefined();
    expect(errors.find((e) => e.property === 'body')).toBeDefined();
  });

  it('should reject when body is empty string', async () => {
    const dto = plainToInstance(CreatePostDto, {
      title: 'My Post',
      body: '',
    });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'body')).toBeDefined();
  });
});
