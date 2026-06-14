import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { CommentRepository } from '../domain/repositories/comment.repository';
import { I18nService } from '../../../core/i18n/i18n.service';

describe('CommentsService', () => {
  let service: CommentsService;

  const mockCommentRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
  };

  const mockI18nService = {
    translate: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: CommentRepository, useValue: mockCommentRepository },
        { provide: I18nService, useValue: mockI18nService },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── create ───────────────────────────────────────────────────────────────

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

  // ─── findAll ──────────────────────────────────────────────────────────────

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

  // ─── findOne ──────────────────────────────────────────────────────────────

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

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update a comment', async () => {
      const dto: UpdateCommentDto = { content: 'Updated content' } as any;
      const updated = { ...mockComment, content: 'Updated content' };
      mockExec.mockResolvedValue(updated);

      const result = await service.update('507f1f77bcf86cd799439011', dto);

      expect(result).toEqual(updated);
      expect(MockCommentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { content: 'Updated content' },
        { new: true },
      );
    });

    it('should return null when comment not found for update', async () => {
      mockExec.mockResolvedValue(null);

      const result = await service.update('ghost-id', {} as any);

      expect(result).toBeNull();
    });
  });

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should delete a root comment with no children', async () => {
      const comment = { ...mockComment, childCommentIds: [], parentCommentId: null };
      mockExec.mockResolvedValue(comment);

      await service.remove('507f1f77bcf86cd799439011');

      expect(MockCommentModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw NotFoundException when comment not found', async () => {
      mockExec.mockResolvedValue(null);

      await expect(service.remove('ghost-id')).rejects.toThrow(NotFoundException);
    });

    it('should cascade delete all child replies when removing root comment', async () => {
      const childIds = ['child-1', 'child-2'];
      const commentWithChildren = { ...mockComment, childCommentIds: childIds, parentCommentId: null };
      mockExec.mockResolvedValue(commentWithChildren);

      await service.remove('507f1f77bcf86cd799439011');

      expect(MockCommentModel.deleteMany).toHaveBeenCalledWith({
        _id: { $in: childIds },
      });
      expect(MockCommentModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should remove reply ID from parent childCommentIds when deleting a reply', async () => {
      const replyComment = {
        ...mockComment,
        _id: 'reply-1',
        parentCommentId: 'parent-id',
        childCommentIds: [],
      };
      mockExec.mockResolvedValue(replyComment);
      MockCommentModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn() });

      await service.remove('reply-1');

      expect(MockCommentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'parent-id',
        { $pull: { childCommentIds: 'reply-1' } },
      );
      expect(MockCommentModel.findByIdAndDelete).toHaveBeenCalledWith('reply-1');
    });
  });

  // ─── createReply ──────────────────────────────────────────────────────────

  describe('createReply', () => {
    it('should create a reply and update parent childCommentIds', async () => {
      const parentComment = {
        ...mockComment,
        _id: 'parent-id',
        parentCommentId: null,
      };
      const createdReply = {
        ...mockComment,
        _id: 'reply-id',
        parentCommentId: 'parent-id',
      };

      MockCommentModel.findById.mockResolvedValueOnce(parentComment);
      mockSave.mockResolvedValue(createdReply);
      MockCommentModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn() });

      const dto: CreateCommentDto = {
        content: 'I agree!',
        postId: '507f1f77bcf86cd799439022',
        parentCommentId: 'parent-id',
      } as any;

      const result = await service.createReply(dto);

      expect(result).toEqual(createdReply);
      expect(MockCommentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'parent-id',
        { $push: { childCommentIds: 'reply-id' } },
      );
    });

    it('should throw NotFoundException when parent comment does not exist', async () => {
      MockCommentModel.findById.mockResolvedValueOnce(null);

      const dto: CreateCommentDto = {
        content: 'Reply',
        postId: 'post-id',
        parentCommentId: 'non-existent-id',
      } as any;

      await expect(service.createReply(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when replying to a reply (max 2 levels)', async () => {
      const replyComment = {
        ...mockComment,
        _id: 'reply-id',
        parentCommentId: 'some-root-id', // This is already a reply
      };
      MockCommentModel.findById.mockResolvedValueOnce(replyComment);

      const dto: CreateCommentDto = {
        content: 'Nested reply',
        postId: 'post-id',
        parentCommentId: 'reply-id',
      } as any;

      await expect(service.createReply(dto)).rejects.toThrow(BadRequestException);
    });

    it('should create a root comment (no parentCommentId) via createReply', async () => {
      mockSave.mockResolvedValue(mockComment);

      const dto: CreateCommentDto = {
        content: 'Root comment',
        postId: 'post-id',
      } as any;

      const result = await service.createReply(dto);

      expect(result).toEqual(mockComment);
      expect(MockCommentModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  // ─── getReplies ───────────────────────────────────────────────────────────

  describe('getReplies', () => {
    it('should return paginated replies for a parent comment', async () => {
      const replies = [
        { ...mockComment, _id: 'r1', parentCommentId: 'parent-id' },
        { ...mockComment, _id: 'r2', parentCommentId: 'parent-id' },
      ];
      mockExec.mockResolvedValue(replies);
      MockCommentModel.countDocuments.mockResolvedValue(2);

      const result = await service.getReplies('parent-id', { skip: 0, limit: 10 });

      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
    });

    it('should use default pagination when not provided', async () => {
      mockExec.mockResolvedValue([]);
      MockCommentModel.countDocuments.mockResolvedValue(0);

      const result = await service.getReplies('parent-id');

      expect(result.total).toBe(0);
      expect(result.items).toHaveLength(0);
    });
  });

  // ─── getCommentWithReplies ─────────────────────────────────────────────────

  describe('getCommentWithReplies', () => {
    it('should return comment with its direct replies', async () => {
      const comment = { ...mockComment, _id: 'root-id' };
      const replies = [
        { ...mockComment, _id: 'reply-1', parentCommentId: 'root-id' },
      ];

      MockCommentModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(comment),
      });
      mockExec.mockResolvedValue(replies);

      const result = await service.getCommentWithReplies('root-id');

      expect(result.replyCount).toBe(1);
      expect(result.replies).toHaveLength(1);
    });

    it('should throw NotFoundException when comment not found', async () => {
      MockCommentModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getCommentWithReplies('ghost-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getCommentThread ─────────────────────────────────────────────────────

  describe('getCommentThread', () => {
    it('should return full thread starting from root comment', async () => {
      const rootComment = { ...mockComment, _id: 'root-id', parentCommentId: null };
      const replies = [
        { ...mockComment, _id: 'r1', parentCommentId: 'root-id' },
        { ...mockComment, _id: 'r2', parentCommentId: 'root-id' },
      ];

      MockCommentModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(rootComment),
      });
      mockExec.mockResolvedValue(replies);

      const result = await service.getCommentThread('root-id');

      expect(result.totalInThread).toBe(3); // root + 2 replies
      expect(result.root.replyCount).toBe(2);
    });

    it('should navigate to root when called with a reply ID', async () => {
      const replyComment = { ...mockComment, _id: 'reply-id', parentCommentId: 'root-id' };
      const rootComment = { ...mockComment, _id: 'root-id', parentCommentId: null };

      MockCommentModel.findById
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(replyComment) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(rootComment) });
      mockExec.mockResolvedValue([]);

      const result = await service.getCommentThread('reply-id');

      expect(result.root.id).toBe('root-id');
    });

    it('should throw NotFoundException when comment not found', async () => {
      MockCommentModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getCommentThread('ghost-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── countCommentsInTree ──────────────────────────────────────────────────

  describe('countCommentsInTree (via getCommentThread)', () => {
    it('should count root + all nested replies correctly', async () => {
      const rootComment = { ...mockComment, _id: 'root-id', parentCommentId: null };
      // 3 direct replies
      const replies = [
        { ...mockComment, _id: 'r1', parentCommentId: 'root-id' },
        { ...mockComment, _id: 'r2', parentCommentId: 'root-id' },
        { ...mockComment, _id: 'r3', parentCommentId: 'root-id' },
      ];

      MockCommentModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(rootComment),
      });
      mockExec.mockResolvedValue(replies);

      const result = await service.getCommentThread('root-id');

      expect(result.totalInThread).toBe(4); // 1 root + 3 replies
    });
  });

  // ─── create with media ────────────────────────────────────────────────────

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

  // ─── getCommentWithMedia ──────────────────────────────────────────────────

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

  // ─── update with media ────────────────────────────────────────────────────

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
