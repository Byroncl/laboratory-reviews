import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { Notification } from '../schemas/notification.schema';
import { NotificationType } from '../schemas/notification.schema';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockSave = jest.fn();
  const mockExec = jest.fn();

  const MockNotificationModel = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: mockSave,
  })) as any;

  MockNotificationModel.find = jest.fn().mockReturnValue({
    exec: mockExec,
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
  });
  MockNotificationModel.findById = jest.fn().mockReturnValue({ exec: mockExec });
  MockNotificationModel.findByIdAndUpdate = jest.fn().mockReturnValue({});
  MockNotificationModel.findByIdAndDelete = jest.fn().mockReturnValue({});
  MockNotificationModel.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 1 });
  MockNotificationModel.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 1 });
  MockNotificationModel.countDocuments = jest.fn().mockResolvedValue(0);

  const mockNotification = {
    _id: '507f1f77bcf86cd799439011',
    userId: 'user-1',
    type: NotificationType.COMMENT_CREATED,
    actorId: 'actor-1',
    actorName: 'alice',
    postId: 'post-1',
    message: 'alice commented on your post',
    read: false,
    createdAt: new Date('2026-06-13T10:00:00Z'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const chainable = {
      exec: mockExec,
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
    };
    MockNotificationModel.find = jest.fn().mockReturnValue(chainable);
    MockNotificationModel.findById = jest.fn().mockReturnValue({ exec: mockExec });
    MockNotificationModel.findByIdAndUpdate = jest.fn().mockReturnValue({});
    MockNotificationModel.findByIdAndDelete = jest.fn().mockReturnValue({});
    MockNotificationModel.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 1 });
    MockNotificationModel.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 1 });
    MockNotificationModel.countDocuments = jest.fn().mockResolvedValue(0);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getModelToken(Notification.name),
          useValue: MockNotificationModel,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create and save a notification', async () => {
      mockSave.mockResolvedValue(mockNotification);

      const result = await service.create({
        userId: 'user-1',
        type: NotificationType.COMMENT_CREATED,
        actorId: 'actor-1',
        actorName: 'alice',
        postId: 'post-1',
        message: 'alice commented on your post',
      });

      expect(result).toEqual(mockNotification);
      expect(mockSave).toHaveBeenCalledTimes(1);
    });

    it('should propagate save errors', async () => {
      mockSave.mockRejectedValue(new Error('Validation error'));

      await expect(service.create({} as any)).rejects.toThrow('Validation error');
    });
  });

  // ─── getByUser ────────────────────────────────────────────────────────────

  describe('getByUser', () => {
    it('should return paginated notifications for a user with unread count', async () => {
      mockExec.mockResolvedValue([mockNotification]);
      MockNotificationModel.countDocuments
        .mockResolvedValueOnce(1)   // total
        .mockResolvedValueOnce(1);  // unread

      const result = await service.getByUser('user-1', { skip: 0, limit: 10 } as any);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.unread).toBe(1);
    });

    it('should use default pagination when not provided', async () => {
      mockExec.mockResolvedValue([]);
      MockNotificationModel.countDocuments.mockResolvedValue(0);

      const result = await service.getByUser('user-1');

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.unread).toBe(0);
    });

    it('should filter by userId', async () => {
      mockExec.mockResolvedValue([mockNotification]);
      MockNotificationModel.countDocuments.mockResolvedValue(1);

      await service.getByUser('user-1');

      expect(MockNotificationModel.find).toHaveBeenCalledWith({ userId: 'user-1' });
    });
  });

  // ─── getUnread ────────────────────────────────────────────────────────────

  describe('getUnread', () => {
    it('should return only unread notifications for a user', async () => {
      const unreadNotif = { ...mockNotification, read: false };
      mockExec.mockResolvedValue([unreadNotif]);

      const result = await service.getUnread('user-1');

      expect(result).toHaveLength(1);
      expect(MockNotificationModel.find).toHaveBeenCalledWith({ userId: 'user-1', read: false });
    });

    it('should return empty array when all notifications are read', async () => {
      mockExec.mockResolvedValue([]);

      const result = await service.getUnread('user-1');

      expect(result).toHaveLength(0);
    });
  });

  // ─── markAsRead ───────────────────────────────────────────────────────────

  describe('markAsRead', () => {
    it('should mark a single notification as read and return updated notification', async () => {
      const readNotification = { ...mockNotification, read: true, readAt: new Date() };
      MockNotificationModel.findByIdAndUpdate = jest.fn().mockReturnValue(readNotification);

      const result = await service.markAsRead('507f1f77bcf86cd799439011');

      expect(result!.read).toBe(true);
      expect(MockNotificationModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        expect.objectContaining({ read: true }),
        { new: true },
      );
    });

    it('should set readAt when marking as read', async () => {
      const now = new Date();
      const readNotification = { ...mockNotification, read: true, readAt: now };
      MockNotificationModel.findByIdAndUpdate = jest.fn().mockReturnValue(readNotification);

      const result = await service.markAsRead('507f1f77bcf86cd799439011');

      expect(result!.readAt).toBeDefined();
    });
  });

  // ─── markAllAsRead ────────────────────────────────────────────────────────

  describe('markAllAsRead', () => {
    it('should update all unread notifications for a user', async () => {
      MockNotificationModel.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 3 });

      await service.markAllAsRead('user-1');

      expect(MockNotificationModel.updateMany).toHaveBeenCalledWith(
        { userId: 'user-1', read: false },
        expect.objectContaining({ read: true }),
      );
    });

    it('should not throw when no unread notifications exist', async () => {
      MockNotificationModel.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 0 });

      await expect(service.markAllAsRead('user-with-no-unread')).resolves.not.toThrow();
    });
  });

  // ─── getUnreadCount ───────────────────────────────────────────────────────

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', async () => {
      MockNotificationModel.countDocuments = jest.fn().mockResolvedValue(5);

      const count = await service.getUnreadCount('user-1');

      expect(count).toBe(5);
      expect(MockNotificationModel.countDocuments).toHaveBeenCalledWith({ userId: 'user-1', read: false });
    });

    it('should return 0 when no unread notifications', async () => {
      MockNotificationModel.countDocuments = jest.fn().mockResolvedValue(0);

      const count = await service.getUnreadCount('user-with-all-read');

      expect(count).toBe(0);
    });
  });

  // ─── deleteNotification ───────────────────────────────────────────────────

  describe('deleteNotification', () => {
    it('should delete a notification by id', async () => {
      MockNotificationModel.findByIdAndDelete = jest.fn().mockResolvedValue(mockNotification);

      await service.deleteNotification('507f1f77bcf86cd799439011');

      expect(MockNotificationModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });

  // ─── deleteByPost ─────────────────────────────────────────────────────────

  describe('deleteByPost', () => {
    it('should delete all notifications for a post', async () => {
      MockNotificationModel.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 3 });

      await service.deleteByPost('post-1');

      expect(MockNotificationModel.deleteMany).toHaveBeenCalledWith({ postId: 'post-1' });
    });

    it('should not throw when post has no notifications', async () => {
      MockNotificationModel.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 0 });

      await expect(service.deleteByPost('ghost-post')).resolves.not.toThrow();
    });
  });

  // ─── deleteByComment ──────────────────────────────────────────────────────

  describe('deleteByComment', () => {
    it('should delete notifications for comment and its parent references', async () => {
      MockNotificationModel.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 2 });

      await service.deleteByComment('comment-1');

      expect(MockNotificationModel.deleteMany).toHaveBeenCalledWith({
        $or: [{ commentId: 'comment-1' }, { parentCommentId: 'comment-1' }],
      });
    });

    it('should not throw when comment has no notifications', async () => {
      MockNotificationModel.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 0 });

      await expect(service.deleteByComment('ghost-comment')).resolves.not.toThrow();
    });
  });
});
