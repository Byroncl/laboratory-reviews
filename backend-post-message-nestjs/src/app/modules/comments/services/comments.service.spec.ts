import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { CommentRepository } from '../domain/repositories/comment.repository';
import { I18nService } from '../../../core/i18n/i18n.service';

describe('CommentsService', () => {
  let service: CommentsService;
  let mockCommentRepository: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    findByUserId: jest.Mock;
    getPostByCommentPostId: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    createReply: jest.Mock;
    getCommentWithReplies: jest.Mock;
    getCommentThread: jest.Mock;
    getReplies: jest.Mock;
  };

  const mockComment = {
    _id: '507f1f77bcf86cd799439011',
    content: 'Great post!',
    postId: '507f1f77bcf86cd799439022',
    authorId: 'user-1',
    childCommentIds: [],
    parentCommentId: null,
    mediaUrls: [],
    mediaTypes: [],
    mediaFilenames: [],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockCommentRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByUserId: jest.fn(),
      getPostByCommentPostId: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      createReply: jest.fn(),
      getCommentWithReplies: jest.fn(),
      getCommentThread: jest.fn(),
      getReplies: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: CommentRepository, useValue: mockCommentRepository },
        { provide: I18nService, useValue: { translate: jest.fn((key: string) => key) } },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to CommentRepository.create', async () => {
      mockCommentRepository.create.mockResolvedValue(mockComment);

      const result = await service.create({ content: 'Great post!', postId: '507f1f77bcf86cd799439022' } as any);

      expect(result).toEqual(mockComment);
      expect(mockCommentRepository.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return all comments when no postId filter', async () => {
      mockCommentRepository.findAll.mockResolvedValue([mockComment]);

      const result = await service.findAll();

      expect(result).toEqual([mockComment]);
      expect(mockCommentRepository.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should filter by postId when provided', async () => {
      mockCommentRepository.findAll.mockResolvedValue([mockComment]);

      const result = await service.findAll('507f1f77bcf86cd799439022');

      expect(result).toEqual([mockComment]);
      expect(mockCommentRepository.findAll).toHaveBeenCalledWith('507f1f77bcf86cd799439022');
    });
  });

  describe('findOne', () => {
    it('should return comment by id', async () => {
      mockCommentRepository.findOne.mockResolvedValue(mockComment);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockComment);
    });

    it('should return null when comment not found', async () => {
      mockCommentRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('ghost-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should delegate to CommentRepository.update', async () => {
      const updated = { ...mockComment, content: 'Updated' };
      mockCommentRepository.update.mockResolvedValue(updated);

      const result = await service.update('507f1f77bcf86cd799439011', { content: 'Updated' } as any);

      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should delegate to CommentRepository.remove', async () => {
      mockCommentRepository.remove.mockResolvedValue(undefined);

      await service.remove('507f1f77bcf86cd799439011');

      expect(mockCommentRepository.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });

  describe('createReply', () => {
    it('should delegate to CommentRepository.createReply', async () => {
      const reply = { ...mockComment, _id: 'reply-id', parentCommentId: '507f1f77bcf86cd799439011' };
      mockCommentRepository.createReply.mockResolvedValue(reply);

      const result = await service.createReply({ content: 'Reply', postId: 'post-id', parentCommentId: '507f1f77bcf86cd799439011' } as any);

      expect(result).toEqual(reply);
    });
  });

  describe('getReplies', () => {
    it('should delegate to CommentRepository.getReplies', async () => {
      const paginatedResult = { items: [mockComment as any], total: 1 };
      mockCommentRepository.getReplies.mockResolvedValue(paginatedResult);

      const result = await service.getReplies('parent-id', { skip: 0, limit: 10 });

      expect(result).toEqual(paginatedResult);
    });
  });

  describe('getCommentWithReplies', () => {
    it('should delegate to CommentRepository.getCommentWithReplies', async () => {
      const treeNode = { id: 'root-id', replies: [], replyCount: 0 } as any;
      mockCommentRepository.getCommentWithReplies.mockResolvedValue(treeNode);

      const result = await service.getCommentWithReplies('root-id');

      expect(result).toEqual(treeNode);
    });
  });

  describe('getCommentThread', () => {
    it('should delegate to CommentRepository.getCommentThread', async () => {
      const thread = { root: { id: 'root-id', replyCount: 0 }, totalInThread: 1 } as any;
      mockCommentRepository.getCommentThread.mockResolvedValue(thread);

      const result = await service.getCommentThread('root-id');

      expect(result).toEqual(thread);
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
});
