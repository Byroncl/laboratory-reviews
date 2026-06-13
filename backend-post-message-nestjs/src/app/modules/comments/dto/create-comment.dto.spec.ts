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

  // New — media fields
  it('should accept valid mediaUrls array with http URLs', async () => {
    const dto = plainToInstance(CreateCommentDto, {
      ...validPayload,
      mediaUrls: ['http://localhost:9000/posts/image1.jpg'],
      mediaTypes: ['image/jpeg'],
      mediaFilenames: ['image1.jpg'],
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should accept comment without media fields (all optional)', async () => {
    const dto = plainToInstance(CreateCommentDto, validPayload);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.mediaUrls).toBeUndefined();
  });

  it('should reject non-array value in mediaUrls', async () => {
    const dto = plainToInstance(CreateCommentDto, {
      ...validPayload,
      mediaUrls: 'http://localhost:9000/posts/img.jpg', // string, not array
    });
    const errors = await validate(dto);
    // class-validator @IsArray checks that the value is an actual array
    expect(errors.find((e) => e.property === 'mediaUrls')).toBeDefined();
  });

  it('should accept multiple media entries for both image and audio URLs', async () => {
    const dto = plainToInstance(CreateCommentDto, {
      ...validPayload,
      mediaUrls: [
        'http://localhost:9000/posts/img.jpg',
        'http://localhost:9000/posts/audio.mp3',
      ],
      mediaTypes: ['image/jpeg', 'audio/mpeg'],
      mediaFilenames: ['img.jpg', 'audio.mp3'],
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.mediaUrls).toHaveLength(2);
    expect(dto.mediaTypes).toHaveLength(2);
  });
});
