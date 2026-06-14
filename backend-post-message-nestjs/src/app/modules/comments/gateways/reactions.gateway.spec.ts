import { Test, TestingModule } from '@nestjs/testing';
import { CommentsGateway } from './comments.gateway';
import { CommentsService } from '../services/comments.service';
import { ReactionsService } from '../services/reactions.service';
import { TranslationService } from '../../../core/utils/translation.service';
import { NotificationsService } from '../../notifications/services/notifications.service';

describe('CommentsGateway — reaction events', () => {
  let gateway: CommentsGateway;
  let mockReactionsService: jest.Mocked<ReactionsService>;
  let mockServer: { emit: jest.Mock };
  let mockClient: {
    id: string;
    emit: jest.Mock;
    broadcast: { emit: jest.Mock };
  };

  beforeEach(async () => {
    mockReactionsService = {
      addReaction: jest.fn(),
      removeReaction: jest.fn(),
      getReactionsByComment: jest.fn(),
      getUserReaction: jest.fn(),
      removeAllUserReactions: jest.fn(),
    } as any;

    mockServer = { emit: jest.fn() };

    mockClient = {
      id: 'socket-1',
      emit: jest.fn(),
      broadcast: { emit: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsGateway,
        {
          provide: CommentsService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn().mockResolvedValue(null),
            getCommentWithMedia: jest.fn((c) => ({ ...c, media: [] })),
          },
        },
        { provide: ReactionsService, useValue: mockReactionsService },
        {
          provide: TranslationService,
          useValue: { translate: jest.fn((key: string) => key) },
        },
        {
          provide: NotificationsService,
          useValue: { create: jest.fn(), markAsRead: jest.fn() },
        },
      ],
    }).compile();

    gateway = module.get<CommentsGateway>(CommentsGateway);
    gateway.server = mockServer as any;
  });

  describe('handleReactionAdd (reaction:add)', () => {
    it('should emit error when user is not registered', async () => {
      // client not in connectedUsers map
      await gateway.handleReactionAdd(mockClient as any, {
        commentId: 'c1',
        emoji: '👍',
      });

      expect(mockClient.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({ message: 'auth.unauthorized' }),
      );
      expect(mockReactionsService.addReaction).not.toHaveBeenCalled();
    });

    it('should add reaction and broadcast reaction:added when user is registered', async () => {
      gateway['connectedUsers'].set('socket-1', { userId: 'u1', username: 'alice' });

      const savedReaction = { commentId: 'c1', userId: 'u1', emoji: '👍' };
      const summary = [{ emoji: '👍', count: 1, users: ['u1'] }];

      mockReactionsService.addReaction.mockResolvedValue(savedReaction as any);
      mockReactionsService.getReactionsByComment.mockResolvedValue(summary as any);

      await gateway.handleReactionAdd(mockClient as any, {
        commentId: 'c1',
        emoji: '👍',
      });

      expect(mockReactionsService.addReaction).toHaveBeenCalledWith(
        expect.objectContaining({ commentId: 'c1', emoji: '👍', userId: 'u1' }),
      );
      expect(mockServer.emit).toHaveBeenCalledWith(
        'reaction:added',
        expect.objectContaining({
          commentId: 'c1',
          emoji: '👍',
          userId: 'u1',
          username: 'alice',
          reactions: summary,
        }),
      );
      expect(mockClient.emit).toHaveBeenCalledWith(
        'reaction:add:success',
        expect.objectContaining({ emoji: '👍' }),
      );
    });

    it('should emit error when addReaction throws', async () => {
      gateway['connectedUsers'].set('socket-1', { userId: 'u1', username: 'alice' });
      mockReactionsService.addReaction.mockRejectedValue(new Error('db error'));

      await gateway.handleReactionAdd(mockClient as any, {
        commentId: 'c1',
        emoji: '👍',
      });

      expect(mockClient.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({ error: 'db error' }),
      );
    });
  });

  describe('handleReactionRemove (reaction:remove)', () => {
    it('should emit error when user is not registered', async () => {
      await gateway.handleReactionRemove(mockClient as any, {
        commentId: 'c1',
        emoji: '👍',
      });

      expect(mockClient.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({ message: 'auth.unauthorized' }),
      );
    });

    it('should remove reaction and broadcast reaction:removed when user is registered', async () => {
      gateway['connectedUsers'].set('socket-1', { userId: 'u1', username: 'alice' });

      const summary = [{ emoji: '❤️', count: 1, users: ['u2'] }];
      mockReactionsService.removeReaction.mockResolvedValue(undefined);
      mockReactionsService.getReactionsByComment.mockResolvedValue(summary as any);

      await gateway.handleReactionRemove(mockClient as any, {
        commentId: 'c1',
        emoji: '👍',
      });

      expect(mockReactionsService.removeReaction).toHaveBeenCalledWith(
        'c1',
        'u1',
        '👍',
      );
      expect(mockServer.emit).toHaveBeenCalledWith(
        'reaction:removed',
        expect.objectContaining({
          commentId: 'c1',
          emoji: '👍',
          userId: 'u1',
          username: 'alice',
          reactions: summary,
        }),
      );
      expect(mockClient.emit).toHaveBeenCalledWith(
        'reaction:remove:success',
        expect.objectContaining({ emoji: '👍' }),
      );
    });

    it('should emit error when removeReaction throws', async () => {
      gateway['connectedUsers'].set('socket-1', { userId: 'u1', username: 'alice' });
      mockReactionsService.removeReaction.mockRejectedValue(new Error('remove failed'));

      await gateway.handleReactionRemove(mockClient as any, {
        commentId: 'c1',
        emoji: '👍',
      });

      expect(mockClient.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({ error: 'remove failed' }),
      );
    });
  });
});
