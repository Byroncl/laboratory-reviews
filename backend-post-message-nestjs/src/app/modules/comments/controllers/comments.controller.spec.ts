import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from '../services/comments.service';
import { ReactionsService } from '../services/reactions.service';
import { CommentsGateway } from '../gateways/comments.gateway';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { FindCommentsByPostDto } from '../dto/find-comments-by-post.dto';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';
import { TranslationService } from '../../../core/utils/translation.service';
import { AUTH_KEY } from '../../../core/decorators/auth.decorator';

describe('CommentsController', () => {
  let controller: CommentsController;
  let mockCommentsService: jest.Mocked<CommentsService>;
  let mockGatewayServer: { emit: jest.Mock };

  const mockComment = {
    _id: '507f1f77bcf86cd799439011',
    content: 'Great post!',
    postId: '507f1f77bcf86cd799439022',
    parentCommentId: null,
    childCommentIds: [],
  } as any;

  beforeEach(async () => {
    mockCommentsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getCommentWithMedia: jest.fn((c) => ({ ...c, media: [] })),
      createReply: jest.fn(),
      getReplies: jest.fn(),
      getCommentThread: jest.fn(),
      getCommentWithReplies: jest.fn(),
    } as any;

    const mockReactionsService = {
      addReaction: jest.fn(),
      removeReaction: jest.fn(),
      getReactionsByComment: jest.fn().mockResolvedValue([]),
      getUserReaction: jest.fn().mockResolvedValue(null),
      removeAllUserReactions: jest.fn(),
    };

    mockGatewayServer = { emit: jest.fn() };
    const mockGateway = { server: mockGatewayServer };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        { provide: CommentsService, useValue: mockCommentsService },
        { provide: ReactionsService, useValue: mockReactionsService },
        { provide: CommentsGateway, useValue: mockGateway },
        {
          provide: TranslationService,
          useValue: { translate: jest.fn((key: string) => key) },
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a comment and return wrapped response', async () => {
      const dto: CreateCommentDto = {
        content: 'Great post!',
        postId: '507f1f77bcf86cd799439022',
      } as any;
      mockCommentsService.create.mockResolvedValue(mockComment);

      const mockCurrentUser = { userId: 'u1', username: 'testuser', type: 'user' } as any;
      const response = await controller.create(dto, mockCurrentUser);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockComment);
      expect(mockCommentsService.create).toHaveBeenCalled();
    });
  });

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return comments filtered by postId', async () => {
      const queryDto: FindCommentsByPostDto = {
        postId: '507f1f77bcf86cd799439022' as any,
      };
      mockCommentsService.findAll.mockResolvedValue([mockComment]);

      const response = await controller.findAll(queryDto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual([mockComment]);
      expect(mockCommentsService.findAll).toHaveBeenCalledWith(queryDto.postId);
    });

    it('should return empty array when no comments match', async () => {
      const queryDto: FindCommentsByPostDto = {
        postId: '507f1f77bcf86cd799439099' as any,
      };
      mockCommentsService.findAll.mockResolvedValue([]);

      const response = await controller.findAll(queryDto);

      expect(response.data).toEqual([]);
    });
  });

  // ─── findOne ──────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return comment by id', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      mockCommentsService.findOne.mockResolvedValue(mockComment);

      const response = await controller.findOne(findOneDto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockComment);
      expect(mockCommentsService.findOne).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null data when comment not found', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439099' };
      mockCommentsService.findOne.mockResolvedValue(null);

      const response = await controller.findOne(findOneDto);

      expect(response.data).toBeNull();
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update a comment and return wrapped response', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      const dto: UpdateCommentDto = { content: 'Updated content' } as any;
      const updated = { ...mockComment, content: 'Updated content' };
      mockCommentsService.update.mockResolvedValue(updated);

      const response = await controller.update(findOneDto, dto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(updated);
      expect(mockCommentsService.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        dto,
      );
    });
  });

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should delete a comment and return success response', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      mockCommentsService.remove.mockResolvedValue(undefined);

      const response = await controller.remove(findOneDto);

      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
      expect(mockCommentsService.remove).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });
  });

  // ─── createReply ──────────────────────────────────────────────────────────

  describe('createReply', () => {
    it('should create a reply and broadcast via WebSocket', async () => {
      const findOneDto: FindOneDto = { id: 'parent-comment-id' };
      const dto: CreateCommentDto = {
        content: 'I agree!',
        postId: '507f1f77bcf86cd799439022',
      } as any;
      const user = { userId: 'user-1' } as any;
      const createdReply = { ...mockComment, _id: 'reply-id', parentCommentId: 'parent-comment-id' };
      mockCommentsService.createReply.mockResolvedValue(createdReply);

      const response = await controller.createReply(findOneDto, dto, user);

      expect(response.success).toBe(true);
      expect(mockCommentsService.createReply).toHaveBeenCalledWith(
        expect.objectContaining({ parentCommentId: 'parent-comment-id', userId: 'user-1' }),
      );
      expect(mockGatewayServer.emit).toHaveBeenCalledWith(
        'comment:reply:created',
        expect.objectContaining({ parentCommentId: 'parent-comment-id' }),
      );
    });

    it('should propagate service errors', async () => {
      const findOneDto: FindOneDto = { id: 'bad-parent-id' };
      const dto: CreateCommentDto = { content: 'Reply', postId: 'p1' } as any;
      const user = { userId: 'u1' } as any;
      mockCommentsService.createReply.mockRejectedValue(new Error('Parent not found'));

      await expect(controller.createReply(findOneDto, dto, user)).rejects.toThrow('Parent not found');
    });
  });

  // ─── getReplies ───────────────────────────────────────────────────────────

  describe('getReplies', () => {
    it('should return paginated replies with metadata', async () => {
      const findOneDto: FindOneDto = { id: 'parent-id' };
      const pagination = { skip: 0, limit: 10 };
      const replies = [{ ...mockComment, parentCommentId: 'parent-id' }];
      mockCommentsService.getReplies.mockResolvedValue({ items: replies, total: 1 });

      const response = await controller.getReplies(findOneDto, pagination);

      expect(response.success).toBe(true);
      expect(response.data).toMatchObject({ total: 1, parentCommentId: 'parent-id' });
      expect(mockCommentsService.getReplies).toHaveBeenCalledWith('parent-id', pagination);
    });
  });

  // ─── getCommentThread ─────────────────────────────────────────────────────

  describe('getCommentThread', () => {
    it('should return the full thread', async () => {
      const findOneDto: FindOneDto = { id: 'root-id' };
      const thread = {
        root: { ...mockComment, replies: [], replyCount: 0 },
        totalInThread: 1,
      };
      mockCommentsService.getCommentThread.mockResolvedValue(thread as any);

      const response = await controller.getCommentThread(findOneDto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(thread);
      expect(mockCommentsService.getCommentThread).toHaveBeenCalledWith('root-id');
    });
  });

  // ─── getCommentWithReplies ─────────────────────────────────────────────────

  describe('getCommentWithReplies', () => {
    it('should return comment with direct replies', async () => {
      const findOneDto: FindOneDto = { id: 'root-id' };
      const tree = { ...mockComment, replies: [], replyCount: 0 };
      mockCommentsService.getCommentWithReplies.mockResolvedValue(tree as any);

      const response = await controller.getCommentWithReplies(findOneDto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(tree);
      expect(mockCommentsService.getCommentWithReplies).toHaveBeenCalledWith('root-id');
    });
  });

  // ─── getCommentWithMedia integration ──────────────────────────────────────

  describe('getCommentWithMedia integration', () => {
    it('should expose getCommentWithMedia on commentsService', () => {
      expect(typeof mockCommentsService.getCommentWithMedia).toBe('function');
    });
  });

  // ─── Auth metadata assertions (TEST-BE-008) ───────────────────────────────

  describe('auth metadata', () => {
    it('create handler carries AUTH_KEY metadata (TEST-BE-008)', () => {
      const metadata = Reflect.getMetadata(AUTH_KEY, controller.create);
      expect(metadata).toBeDefined();
    });

    it('findAll handler does NOT carry AUTH_KEY metadata (public read)', () => {
      const metadata = Reflect.getMetadata(AUTH_KEY, controller.findAll);
      expect(metadata).toBeUndefined();
    });

    it('findOne handler does NOT carry AUTH_KEY metadata (public read)', () => {
      const metadata = Reflect.getMetadata(AUTH_KEY, controller.findOne);
      expect(metadata).toBeUndefined();
    });

    it('getReplies handler does NOT carry AUTH_KEY metadata (public read)', () => {
      const metadata = Reflect.getMetadata(AUTH_KEY, controller.getReplies);
      expect(metadata).toBeUndefined();
    });

    it('getCommentThread handler does NOT carry AUTH_KEY metadata (public read)', () => {
      const metadata = Reflect.getMetadata(AUTH_KEY, controller.getCommentThread);
      expect(metadata).toBeUndefined();
    });

    it('getCommentWithReplies handler does NOT carry AUTH_KEY metadata (public read)', () => {
      const metadata = Reflect.getMetadata(AUTH_KEY, controller.getCommentWithReplies);
      expect(metadata).toBeUndefined();
    });

    it('getReactions handler does NOT carry AUTH_KEY metadata (public read)', () => {
      const metadata = Reflect.getMetadata(AUTH_KEY, controller.getReactions);
      expect(metadata).toBeUndefined();
    });
  });

  // ─── Public read contracts (TEST-BE-003, TEST-BE-004, TEST-BE-005) ────────

  describe('findAll — public read (TEST-BE-003)', () => {
    it('should return comments without auth context', async () => {
      const queryDto: FindCommentsByPostDto = {
        postId: '507f1f77bcf86cd799439022' as any,
      };
      mockCommentsService.findAll.mockResolvedValue([mockComment]);

      const response = await controller.findAll(queryDto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual([mockComment]);
    });
  });

  describe('getReplies — public read (TEST-BE-004)', () => {
    it('should return replies without auth context', async () => {
      const findOneDto: FindOneDto = { id: 'parent-id' };
      const pagination = { skip: 0, limit: 10 };
      mockCommentsService.getReplies.mockResolvedValue({ items: [mockComment], total: 1 });

      const response = await controller.getReplies(findOneDto, pagination);

      expect(response.success).toBe(true);
      expect(response.data).toMatchObject({ total: 1, parentCommentId: 'parent-id' });
    });
  });

  describe('getReactions — public read (TEST-BE-005)', () => {
    it('should return reactions with userReacted:false when no user provided', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };

      const response = await controller.getReactions(findOneDto, undefined);

      expect(response.success).toBe(true);
      expect(response.data.userReacted).toBe(false);
      expect(response.data.userReaction).toBeNull();
    });
  });
});
