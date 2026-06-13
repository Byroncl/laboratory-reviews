import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CommentsService } from './comments.service';
import { Comment } from '../schemas/comment.schema';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';

describe('CommentsService', () => {
  let service: CommentsService;

  const mockSave = jest.fn();
  const mockExec = jest.fn();

  const MockCommentModel = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: mockSave,
  })) as any;

  MockCommentModel.find = jest.fn().mockReturnValue({ exec: mockExec });
  MockCommentModel.findById = jest.fn().mockReturnValue({ exec: mockExec });
  MockCommentModel.findByIdAndUpdate = jest.fn().mockReturnValue({ exec: mockExec });
  MockCommentModel.findByIdAndDelete = jest.fn().mockReturnValue({ exec: mockExec });

  const mockComment = {
    _id: '507f1f77bcf86cd799439011',
    content: 'Great post!',
    postId: '507f1f77bcf86cd799439022',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getModelToken(Comment.name), useValue: MockCommentModel },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a comment', async () => {
      const dto: CreateCommentDto = {
        content: 'Great post!',
        postId: '507f1f77bcf86cd799439022',
      } as any;
      mockSave.mockResolvedValue(mockComment);

      const result = await service.create(dto);

      expect(result).toEqual(mockComment);
      expect(mockSave).toHaveBeenCalledTimes(1);
    });

    it('should propagate save errors', async () => {
      mockSave.mockRejectedValue(new Error('Validation error'));

      await expect(service.create({} as any)).rejects.toThrow('Validation error');
    });
  });

  describe('findAll', () => {
    it('should return all comments when no postId filter', async () => {
      mockExec.mockResolvedValue([mockComment]);

      const result = await service.findAll();

      expect(result).toEqual([mockComment]);
      expect(MockCommentModel.find).toHaveBeenCalledWith({});
    });

    it('should filter by postId when provided', async () => {
      const postId = '507f1f77bcf86cd799439022';
      mockExec.mockResolvedValue([mockComment]);

      const result = await service.findAll(postId);

      expect(result).toEqual([mockComment]);
      expect(MockCommentModel.find).toHaveBeenCalledWith({ postId });
    });

    it('should return empty array when no comments match', async () => {
      mockExec.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return comment by id', async () => {
      mockExec.mockResolvedValue(mockComment);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockComment);
      expect(MockCommentModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null when comment not found', async () => {
      mockExec.mockResolvedValue(null);

      const result = await service.findOne('ghost-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const dto: UpdateCommentDto = { content: 'Updated content' } as any;
      const updated = { ...mockComment, content: 'Updated content' };
      mockExec.mockResolvedValue(updated);

      const result = await service.update('507f1f77bcf86cd799439011', dto);

      expect(result).toEqual(updated);
      expect(MockCommentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        dto,
        { new: true },
      );
    });

    it('should return null when comment not found for update', async () => {
      mockExec.mockResolvedValue(null);

      const result = await service.update('ghost-id', {} as any);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a comment', async () => {
      mockExec.mockResolvedValue(mockComment);

      const result = await service.remove('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockComment);
      expect(MockCommentModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null when comment not found for delete', async () => {
      mockExec.mockResolvedValue(null);

      const result = await service.remove('ghost-id');

      expect(result).toBeNull();
    });
  });

  describe('create with media', () => {
    it('should persist mediaUrls, mediaTypes, and mediaFilenames', async () => {
      const dtoWithMedia: CreateCommentDto = {
        content: 'Great post with image!',
        postId: '507f1f77bcf86cd799439022',
        mediaUrls: ['http://localhost:9000/posts/img.jpg'],
        mediaTypes: ['image/jpeg'],
        mediaFilenames: ['img.jpg'],
      } as any;
      const savedComment = { ...dtoWithMedia, _id: '507f1f77bcf86cd799439011' };
      mockSave.mockResolvedValue(savedComment);

      const result = await service.create(dtoWithMedia);

      expect(result).toEqual(savedComment);
      expect(MockCommentModel).toHaveBeenCalledWith(
        expect.objectContaining({
          mediaUrls: ['http://localhost:9000/posts/img.jpg'],
          mediaTypes: ['image/jpeg'],
          mediaFilenames: ['img.jpg'],
        }),
      );
    });

    it('should default to empty arrays when media fields are not provided', async () => {
      const dto: CreateCommentDto = {
        content: 'Text only comment',
        postId: '507f1f77bcf86cd799439022',
      } as any;
      mockSave.mockResolvedValue({ ...dto, _id: 'cid' });

      await service.create(dto);

      expect(MockCommentModel).toHaveBeenCalledWith(
        expect.objectContaining({
          mediaUrls: [],
          mediaTypes: [],
          mediaFilenames: [],
        }),
      );
    });
  });

  describe('getCommentWithMedia', () => {
    it('should return media array built from mediaUrls, mediaTypes, and mediaFilenames', () => {
      const commentDoc = {
        _id: 'c1',
        content: 'hello',
        mediaUrls: ['http://localhost:9000/posts/img.jpg'],
        mediaTypes: ['image/jpeg'],
        mediaFilenames: ['img.jpg'],
        toObject: () => ({
          _id: 'c1',
          content: 'hello',
          mediaUrls: ['http://localhost:9000/posts/img.jpg'],
          mediaTypes: ['image/jpeg'],
          mediaFilenames: ['img.jpg'],
        }),
      };

      const result = service.getCommentWithMedia(commentDoc as any);

      expect(result.media).toHaveLength(1);
      expect(result.media[0]).toEqual({
        url: 'http://localhost:9000/posts/img.jpg',
        type: 'image/jpeg',
        filename: 'img.jpg',
      });
    });

    it('should return media array with audio entry', () => {
      const commentDoc = {
        _id: 'c2',
        content: 'voice note',
        mediaUrls: ['http://localhost:9000/posts/audio.mp3'],
        mediaTypes: ['audio/mpeg'],
        mediaFilenames: ['audio.mp3'],
        toObject: () => ({
          _id: 'c2',
          content: 'voice note',
          mediaUrls: ['http://localhost:9000/posts/audio.mp3'],
          mediaTypes: ['audio/mpeg'],
          mediaFilenames: ['audio.mp3'],
        }),
      };

      const result = service.getCommentWithMedia(commentDoc as any);

      expect(result.media[0].type).toBe('audio/mpeg');
      expect(result.media[0].url).toContain('.mp3');
    });

    it('should return empty media array when no mediaUrls', () => {
      const commentDoc = {
        _id: 'c3',
        content: 'text only',
        mediaUrls: [],
        mediaTypes: [],
        mediaFilenames: [],
        toObject: () => ({
          _id: 'c3',
          content: 'text only',
          mediaUrls: [],
          mediaTypes: [],
          mediaFilenames: [],
        }),
      };

      const result = service.getCommentWithMedia(commentDoc as any);

      expect(result.media).toHaveLength(0);
    });

    it('should handle missing mediaTypes/mediaFilenames gracefully', () => {
      const commentDoc = {
        _id: 'c4',
        content: 'partial',
        mediaUrls: ['http://localhost:9000/posts/img.jpg'],
        toObject: () => ({
          _id: 'c4',
          content: 'partial',
          mediaUrls: ['http://localhost:9000/posts/img.jpg'],
        }),
      };

      const result = service.getCommentWithMedia(commentDoc as any);

      expect(result.media[0].type).toBe('unknown');
      expect(result.media[0].filename).toBe('media-0');
    });
  });

  describe('update with media', () => {
    it('should update mediaUrls when provided in updateDto', async () => {
      const dto: UpdateCommentDto = {
        mediaUrls: ['http://localhost:9000/posts/new.png'],
        mediaTypes: ['image/png'],
        mediaFilenames: ['new.png'],
      } as any;
      const updated = { ...mockComment, ...dto };
      mockExec.mockResolvedValue(updated);

      const result = await service.update('507f1f77bcf86cd799439011', dto);

      expect(result).toEqual(updated);
      expect(MockCommentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        expect.objectContaining({
          mediaUrls: ['http://localhost:9000/posts/new.png'],
          mediaTypes: ['image/png'],
          mediaFilenames: ['new.png'],
        }),
        { new: true },
      );
    });

    it('should not include media fields in update when not provided', async () => {
      const dto: UpdateCommentDto = { content: 'Updated only content' } as any;
      const updated = { ...mockComment, content: 'Updated only content' };
      mockExec.mockResolvedValue(updated);

      await service.update('507f1f77bcf86cd799439011', dto);

      const callArg = MockCommentModel.findByIdAndUpdate.mock.calls[0][1];
      expect(callArg.mediaUrls).toBeUndefined();
    });
  });
});
