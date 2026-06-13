import { Test, TestingModule } from '@nestjs/testing';
import { CommentsGateway } from './comments.gateway';
import { CommentsService } from '../services/comments.service';
import { ReactionsService } from '../services/reactions.service';
import { TranslationService } from '../../../core/utils/translation.service';

describe('CommentsGateway', () => {
  let gateway: CommentsGateway;
  let mockService: jest.Mocked<CommentsService>;
  let mockI18n: jest.Mocked<TranslationService>;
  let mockServer: { emit: jest.Mock };
  let mockClient: {
    id: string;
    emit: jest.Mock;
    broadcast: { emit: jest.Mock };
    handshake: { auth: { token: string } };
  };

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findAll: jest.fn(),
      getCommentWithMedia: jest.fn((c) => ({ ...c, media: [] })),
      createReply: jest.fn(),
      getCommentThread: jest.fn(),
    } as unknown as jest.Mocked<CommentsService>;

    mockI18n = {
      translate: jest.fn((key: string) => key),
    } as unknown as jest.Mocked<TranslationService>;

    mockServer = { emit: jest.fn() };

    mockClient = {
      id: 'socket-1',
      emit: jest.fn(),
      broadcast: { emit: jest.fn() },
      handshake: { auth: { token: 'valid-token' } },
    };

    const mockReactionsService = {
      addReaction: jest.fn(),
      removeReaction: jest.fn(),
      getReactionsByComment: jest.fn().mockResolvedValue([]),
      getUserReaction: jest.fn().mockResolvedValue(null),
      removeAllUserReactions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsGateway,
        { provide: CommentsService, useValue: mockService },
        { provide: ReactionsService, useValue: mockReactionsService },
        { provide: TranslationService, useValue: mockI18n },
      ],
    }).compile();

    gateway = module.get<CommentsGateway>(CommentsGateway);
    gateway.server = mockServer as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  // ─── Connection ───────────────────────────────────────────────────────────

  describe('handleConnection', () => {
    it('should emit user:connected with clientId and totalConnected', () => {
      gateway.handleConnection(mockClient as any);

      expect(mockServer.emit).toHaveBeenCalledWith('user:connected', {
        clientId: 'socket-1',
        totalConnected: expect.any(Number),
      });
    });
  });

  describe('handleDisconnect', () => {
    it('should emit user:disconnected and remove client from map', () => {
      // Register client first
      gateway['connectedUsers'].set('socket-1', { userId: '1', username: 'u' });

      gateway.handleDisconnect(mockClient as any);

      expect(mockServer.emit).toHaveBeenCalledWith('user:disconnected', {
        clientId: 'socket-1',
        totalConnected: 0,
      });
      expect(gateway['connectedUsers'].has('socket-1')).toBe(false);
    });
  });

  // ─── User registration ────────────────────────────────────────────────────

  describe('handleUserRegister', () => {
    it('should store user in connectedUsers map', async () => {
      await gateway.handleUserRegister(mockClient as any, {
        userId: 'u1',
        username: 'alice',
      });

      expect(gateway['connectedUsers'].get('socket-1')).toEqual({
        userId: 'u1',
        username: 'alice',
      });
    });

    it('should broadcast user:joined to all clients', async () => {
      await gateway.handleUserRegister(mockClient as any, {
        userId: 'u1',
        username: 'alice',
      });

      expect(mockServer.emit).toHaveBeenCalledWith('user:joined', {
        userId: 'u1',
        username: 'alice',
        message: expect.any(String),
      });
    });
  });

  // ─── Comment operations ───────────────────────────────────────────────────

  describe('comment operations (with registered user)', () => {
    beforeEach(() => {
      gateway['connectedUsers'].set('socket-1', {
        userId: 'user-1',
        username: 'testuser',
      });
    });

    describe('handleCommentCreate', () => {
      it('should broadcast comment:created and confirm to client', async () => {
        const commentData = {
          postId: 'post-1',
          content: 'Test comment',
          userId: 'user-1',
        };
        const createdComment = {
          _id: 'c1',
          ...commentData,
          createdAt: new Date(),
        };
        mockService.create.mockResolvedValue(createdComment as any);

        await gateway.handleCommentCreate(mockClient as any, commentData);

        expect(mockService.create).toHaveBeenCalledWith(commentData);
        expect(mockServer.emit).toHaveBeenCalledWith(
          'comment:created',
          expect.objectContaining({ id: 'c1', postId: 'post-1' }),
        );
        expect(mockClient.emit).toHaveBeenCalledWith(
          'comment:created:success',
          expect.objectContaining({ id: 'c1' }),
        );
      });

      it('should emit error to client when create fails', async () => {
        mockService.create.mockRejectedValue(new Error('DB error'));

        await gateway.handleCommentCreate(mockClient as any, {});

        expect(mockClient.emit).toHaveBeenCalledWith(
          'error',
          expect.objectContaining({ error: 'DB error' }),
        );
      });

      it('should include media array in comment:created broadcast', async () => {
        const commentData = { postId: 'post-1', content: 'With image', userId: 'user-1' };
        const createdComment = {
          _id: 'c2',
          ...commentData,
          createdAt: new Date(),
        };
        mockService.create.mockResolvedValue(createdComment as any);
        (mockService.getCommentWithMedia as jest.Mock).mockReturnValue({
          ...createdComment,
          media: [{ url: 'http://localhost:9000/posts/img.jpg', type: 'image/jpeg', filename: 'img.jpg' }],
        });

        await gateway.handleCommentCreate(mockClient as any, commentData);

        expect(mockServer.emit).toHaveBeenCalledWith(
          'comment:created',
          expect.objectContaining({
            media: expect.arrayContaining([
              expect.objectContaining({ type: 'image/jpeg' }),
            ]),
          }),
        );
      });
    });

    describe('handleCommentUpdate', () => {
      it('should broadcast comment:updated and confirm to client', async () => {
        const updatedComment = {
          _id: 'c1',
          content: 'Updated',
          updatedAt: new Date(),
        };
        mockService.update.mockResolvedValue(updatedComment as any);

        await gateway.handleCommentUpdate(mockClient as any, {
          id: 'c1',
          content: 'Updated',
        });

        expect(mockService.update).toHaveBeenCalledWith('c1', {
          content: 'Updated',
        });
        expect(mockServer.emit).toHaveBeenCalledWith(
          'comment:updated',
          expect.objectContaining({ id: 'c1' }),
        );
        expect(mockClient.emit).toHaveBeenCalledWith(
          'comment:updated:success',
          expect.objectContaining({ id: 'c1' }),
        );
      });

      it('should emit error when update fails', async () => {
        mockService.update.mockRejectedValue(new Error('not found'));

        await gateway.handleCommentUpdate(mockClient as any, {
          id: 'ghost',
          content: 'x',
        });

        expect(mockClient.emit).toHaveBeenCalledWith(
          'error',
          expect.objectContaining({ error: 'not found' }),
        );
      });
    });

    describe('handleCommentDelete', () => {
      it('should broadcast comment:deleted and confirm to client', async () => {
        mockService.remove.mockResolvedValue(undefined as any);

        await gateway.handleCommentDelete(mockClient as any, { id: 'c1' });

        expect(mockService.remove).toHaveBeenCalledWith('c1');
        expect(mockServer.emit).toHaveBeenCalledWith(
          'comment:deleted',
          expect.objectContaining({ id: 'c1' }),
        );
        expect(mockClient.emit).toHaveBeenCalledWith(
          'comment:deleted:success',
          expect.objectContaining({ id: 'c1' }),
        );
      });

      it('should emit error when delete fails', async () => {
        mockService.remove.mockRejectedValue(new Error('remove error'));

        await gateway.handleCommentDelete(mockClient as any, { id: 'ghost' });

        expect(mockClient.emit).toHaveBeenCalledWith(
          'error',
          expect.objectContaining({ error: 'remove error' }),
        );
      });
    });
  });

  describe('handleCommentCreate without registered user', () => {
    it('should emit auth error when user is not registered', async () => {
      // client not in connectedUsers
      await gateway.handleCommentCreate(mockClient as any, {});

      expect(mockClient.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({ message: 'auth.unauthorized' }),
      );
    });
  });

  // ─── Comments list ────────────────────────────────────────────────────────

  describe('handleCommentsList', () => {
    it('should emit comments:list:success with comments array', async () => {
      const comments = [{ _id: 'c1', content: 'hello' }];
      mockService.findAll.mockResolvedValue(comments as any);

      await gateway.handleCommentsList(mockClient as any, { postId: 'post-1' });

      expect(mockService.findAll).toHaveBeenCalledWith('post-1');
      expect(mockClient.emit).toHaveBeenCalledWith('comments:list:success', {
        postId: 'post-1',
        comments,
        total: 1,
      });
    });

    it('should emit error when findAll fails', async () => {
      mockService.findAll.mockRejectedValue(new Error('db fail'));

      await gateway.handleCommentsList(mockClient as any, { postId: 'p1' });

      expect(mockClient.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({ error: 'db fail' }),
      );
    });
  });

  // ─── Typing events ────────────────────────────────────────────────────────

  describe('handleCommentTyping', () => {
    it('should broadcast typing event to all other clients', () => {
      const data = { postId: 'post-1', username: 'alice' };

      gateway.handleCommentTyping(mockClient as any, data);

      expect(mockClient.broadcast.emit).toHaveBeenCalledWith(
        'comment:typing',
        data,
      );
    });
  });

  describe('handleCommentTypingStop', () => {
    it('should broadcast typing stop event to all other clients', () => {
      const data = { postId: 'post-1', username: 'alice' };

      gateway.handleCommentTypingStop(mockClient as any, data);

      expect(mockClient.broadcast.emit).toHaveBeenCalledWith(
        'comment:typing:stop',
        data,
      );
    });
  });

  // ─── Nested comments / Replies ───────────────────────────────────────────

  describe('handleReplyCreate', () => {
    beforeEach(() => {
      gateway['connectedUsers'].set('socket-1', {
        userId: 'user-1',
        username: 'testuser',
      });
    });

    it('should broadcast reply:created and confirm to client', async () => {
      const replyData = {
        postId: 'post-1',
        content: 'I agree!',
        parentCommentId: 'parent-id',
      };
      const createdReply = { _id: 'reply-1', ...replyData };
      (mockService.createReply as jest.Mock).mockResolvedValue(createdReply);

      await gateway.handleReplyCreate(mockClient as any, replyData);

      expect(mockService.createReply).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', parentCommentId: 'parent-id' }),
      );
      expect(mockServer.emit).toHaveBeenCalledWith(
        'reply:created',
        expect.objectContaining({ parentCommentId: 'parent-id' }),
      );
      expect(mockClient.emit).toHaveBeenCalledWith(
        'reply:create:success',
        expect.objectContaining({ replyId: 'reply-1' }),
      );
    });

    it('should emit error when user is not registered', async () => {
      gateway['connectedUsers'].delete('socket-1');

      await gateway.handleReplyCreate(mockClient as any, { parentCommentId: 'p1' });

      expect(mockClient.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({ message: 'auth.unauthorized' }),
      );
    });

    it('should emit error when createReply throws', async () => {
      (mockService.createReply as jest.Mock).mockRejectedValue(new Error('Parent not found'));

      await gateway.handleReplyCreate(mockClient as any, { parentCommentId: 'bad-id' });

      expect(mockClient.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({ error: 'Parent not found' }),
      );
    });
  });

  describe('handleGetThread', () => {
    it('should emit thread:data with thread content', async () => {
      const thread = { root: { id: 'root-1', replies: [] }, totalInThread: 1 };
      (mockService.getCommentThread as jest.Mock).mockResolvedValue(thread);

      await gateway.handleGetThread(mockClient as any, { commentId: 'root-1' });

      expect(mockService.getCommentThread).toHaveBeenCalledWith('root-1');
      expect(mockClient.emit).toHaveBeenCalledWith('thread:data', { thread });
    });

    it('should emit error when getCommentThread throws', async () => {
      (mockService.getCommentThread as jest.Mock).mockRejectedValue(new Error('not found'));

      await gateway.handleGetThread(mockClient as any, { commentId: 'ghost' });

      expect(mockClient.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({ error: 'not found' }),
      );
    });
  });

  // ─── Connected users ──────────────────────────────────────────────────────

  describe('handleGetConnectedUsers', () => {
    it('should emit users:connected:success with count and list', async () => {
      gateway['connectedUsers'].set('socket-1', {
        userId: 'u1',
        username: 'alice',
      });
      gateway['connectedUsers'].set('socket-2', {
        userId: 'u2',
        username: 'bob',
      });

      await gateway.handleGetConnectedUsers(mockClient as any);

      expect(mockClient.emit).toHaveBeenCalledWith(
        'users:connected:success',
        expect.objectContaining({ count: 2 }),
      );
    });

    it('should emit empty users list when no one is connected', async () => {
      await gateway.handleGetConnectedUsers(mockClient as any);

      expect(mockClient.emit).toHaveBeenCalledWith('users:connected:success', {
        count: 0,
        users: [],
      });
    });
  });
});
