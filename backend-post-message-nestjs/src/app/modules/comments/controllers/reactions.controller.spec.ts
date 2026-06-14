import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from '../services/comments.service';
import { ReactionsService } from '../services/reactions.service';
import { CommentsGateway } from '../gateways/comments.gateway';
import { TranslationService } from '../../../core/utils/translation.service';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';
import { CreateReactionDto } from '../dto/create-reaction.dto';

describe('CommentsController — reaction endpoints', () => {
  let controller: CommentsController;
  let mockReactionsService: jest.Mocked<ReactionsService>;
  let mockGateway: { server: { emit: jest.Mock } };

  const mockUser = { userId: 'user-abc', username: 'alice', type: 'user' as const };
  const commentId = '507f1f77bcf86cd799439011';

  beforeEach(async () => {
    mockReactionsService = {
      addReaction: jest.fn(),
      removeReaction: jest.fn(),
      getReactionsByComment: jest.fn(),
      getUserReaction: jest.fn(),
      removeAllUserReactions: jest.fn(),
    } as any;

    mockGateway = {
      server: { emit: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getCommentWithMedia: jest.fn((c) => ({ ...c, media: [] })),
          },
        },
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

  // ─── POST :id/reactions ────────────────────────────────────────────────────

  describe('addReaction', () => {
    it('should add reaction and broadcast via gateway', async () => {
      const findOneDto: FindOneDto = { id: commentId };
      const dto: CreateReactionDto = { commentId, userId: mockUser.userId, emoji: '👍' };
      const savedReaction = { commentId, userId: mockUser.userId, emoji: '👍', _id: 'r1' };
      const summary = [{ emoji: '👍', count: 1, users: [mockUser.userId] }];

      mockReactionsService.addReaction.mockResolvedValue(savedReaction as any);
      mockReactionsService.getReactionsByComment.mockResolvedValue(summary as any);

      const response = await controller.addReaction(findOneDto, dto, mockUser as any);

      expect(response.success).toBe(true);
      expect(mockReactionsService.addReaction).toHaveBeenCalledWith(
        expect.objectContaining({ commentId, userId: mockUser.userId, emoji: '👍' }),
      );
      expect(mockReactionsService.getReactionsByComment).toHaveBeenCalledWith(commentId);
      expect(mockGateway.server.emit).toHaveBeenCalledWith(
        'comment:reaction:added',
        expect.objectContaining({ commentId, emoji: '👍', userId: mockUser.userId }),
      );
    });

    it('should override commentId from param, not from body', async () => {
      const findOneDto: FindOneDto = { id: commentId };
      const dto: CreateReactionDto = {
        commentId: 'body-id-should-be-ignored',
        userId: 'ignored',
        emoji: '😂',
      };
      const savedReaction = { commentId, userId: mockUser.userId, emoji: '😂', _id: 'r2' };
      mockReactionsService.addReaction.mockResolvedValue(savedReaction as any);
      mockReactionsService.getReactionsByComment.mockResolvedValue([]);

      await controller.addReaction(findOneDto, dto, mockUser as any);

      expect(mockReactionsService.addReaction).toHaveBeenCalledWith(
        expect.objectContaining({ commentId, userId: mockUser.userId }),
      );
    });
  });

  // ─── DELETE :id/reactions/:emoji ──────────────────────────────────────────

  describe('removeReaction', () => {
    it('should remove reaction and broadcast via gateway', async () => {
      const params = { id: commentId, emoji: '👍' };
      const summary = [{ emoji: '❤️', count: 1, users: ['u2'] }];

      mockReactionsService.removeReaction.mockResolvedValue(undefined);
      mockReactionsService.getReactionsByComment.mockResolvedValue(summary as any);

      const response = await controller.removeReaction(params, mockUser as any);

      expect(response.success).toBe(true);
      expect(mockReactionsService.removeReaction).toHaveBeenCalledWith(
        commentId,
        mockUser.userId,
        '👍',
      );
      expect(mockGateway.server.emit).toHaveBeenCalledWith(
        'comment:reaction:removed',
        expect.objectContaining({ commentId, emoji: '👍', userId: mockUser.userId }),
      );
    });
  });

  // ─── GET :id/reactions ────────────────────────────────────────────────────

  describe('getReactions', () => {
    it('should return reactions summary with userReacted=true when user has reacted', async () => {
      const findOneDto: FindOneDto = { id: commentId };
      const summary = [{ emoji: '👍', count: 2, users: ['u1', 'u2'] }];

      mockReactionsService.getReactionsByComment.mockResolvedValue(summary as any);
      mockReactionsService.getUserReaction.mockResolvedValue('👍');

      const response = await controller.getReactions(findOneDto, mockUser as any);

      expect(response.success).toBe(true);
      expect(response.data).toMatchObject({
        commentId,
        total: 2,
        userReacted: true,
        userReaction: '👍',
      });
    });

    it('should return userReacted=false when user has not reacted', async () => {
      const findOneDto: FindOneDto = { id: commentId };
      mockReactionsService.getReactionsByComment.mockResolvedValue([]);
      mockReactionsService.getUserReaction.mockResolvedValue(null);

      const response = await controller.getReactions(findOneDto, mockUser as any);

      expect(response.data.userReacted).toBe(false);
      expect(response.data.userReaction).toBeNull();
    });

    it('should return total as sum of all emoji counts', async () => {
      const findOneDto: FindOneDto = { id: commentId };
      const summary = [
        { emoji: '👍', count: 5, users: [] },
        { emoji: '❤️', count: 3, users: [] },
      ];
      mockReactionsService.getReactionsByComment.mockResolvedValue(summary as any);
      mockReactionsService.getUserReaction.mockResolvedValue(null);

      const response = await controller.getReactions(findOneDto, mockUser as any);

      expect(response.data.total).toBe(8);
    });
  });
});
