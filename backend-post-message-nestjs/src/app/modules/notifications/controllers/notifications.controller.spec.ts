import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from '../services/notifications.service';
import { TranslationService } from '../../../core/utils/translation.service';
import { NotificationType } from '../schemas/notification.schema';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let mockService: jest.Mocked<NotificationsService>;
  let mockI18n: jest.Mocked<TranslationService>;

  const mockUser = { userId: 'user-1', username: 'alice', type: 'user' as const };

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
    mockService = {
      getByUser: jest.fn(),
      getUnread: jest.fn(),
      getUnreadCount: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      deleteNotification: jest.fn(),
    } as unknown as jest.Mocked<NotificationsService>;

    mockI18n = {
      translate: jest.fn((key: string) => key),
    } as unknown as jest.Mocked<TranslationService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockService },
        { provide: TranslationService, useValue: mockI18n },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─── GET /notifications ────────────────────────────────────────────────────

  describe('getNotifications', () => {
    it('should return paginated notifications with unread count', async () => {
      const payload = {
        items: [mockNotification],
        total: 1,
        unread: 1,
      };
      mockService.getByUser.mockResolvedValue(payload as any);

      const result = await controller.getNotifications(mockUser, { skip: 0, limit: 10 } as any);

      expect(mockService.getByUser).toHaveBeenCalledWith('user-1', { skip: 0, limit: 10 });
      expect(result.data).toEqual(payload);
      expect(result.success).toBe(true);
    });

    it('should pass userId from current user to service', async () => {
      mockService.getByUser.mockResolvedValue({ items: [], total: 0, unread: 0 });

      await controller.getNotifications({ userId: 'user-42', username: 'bob', type: 'user' }, { skip: 0, limit: 10 } as any);

      expect(mockService.getByUser).toHaveBeenCalledWith('user-42', {});
    });
  });

  // ─── GET /notifications/unread ─────────────────────────────────────────────

  describe('getUnreadNotifications', () => {
    it('should return unread notifications with count', async () => {
      mockService.getUnread.mockResolvedValue([mockNotification] as any);

      const result = await controller.getUnreadNotifications(mockUser);

      expect(mockService.getUnread).toHaveBeenCalledWith('user-1');
      expect(result.data.notifications).toHaveLength(1);
      expect(result.data.count).toBe(1);
    });

    it('should return empty list when no unread notifications', async () => {
      mockService.getUnread.mockResolvedValue([]);

      const result = await controller.getUnreadNotifications(mockUser);

      expect(result.data.count).toBe(0);
      expect(result.data.notifications).toHaveLength(0);
    });
  });

  // ─── GET /notifications/unread-count ──────────────────────────────────────

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', async () => {
      mockService.getUnreadCount.mockResolvedValue(5);

      const result = await controller.getUnreadCount(mockUser);

      expect(mockService.getUnreadCount).toHaveBeenCalledWith('user-1');
      expect(result.data.count).toBe(5);
    });

    it('should return 0 when all notifications are read', async () => {
      mockService.getUnreadCount.mockResolvedValue(0);

      const result = await controller.getUnreadCount(mockUser);

      expect(result.data.count).toBe(0);
    });
  });

  // ─── PUT /notifications/:id/read ──────────────────────────────────────────

  describe('markAsRead', () => {
    it('should mark notification as read and return it', async () => {
      const readNotif = { ...mockNotification, read: true };
      mockService.markAsRead.mockResolvedValue(readNotif as any);

      const result = await controller.markAsRead({ id: '507f1f77bcf86cd799439011' });

      expect(mockService.markAsRead).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result.data).toEqual(readNotif);
    });

    it('should include success message in response', async () => {
      const readNotif = { ...mockNotification, read: true };
      mockService.markAsRead.mockResolvedValue(readNotif as any);
      mockI18n.translate.mockReturnValue('Notification marked as read');

      const result = await controller.markAsRead({ id: '507f1f77bcf86cd799439011' });

      expect(result.message).toBe('Notification marked as read');
    });
  });

  // ─── PUT /notifications/read/all ──────────────────────────────────────────

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for the current user', async () => {
      mockService.markAllAsRead.mockResolvedValue();

      const result = await controller.markAllAsRead(mockUser);

      expect(mockService.markAllAsRead).toHaveBeenCalledWith('user-1');
      expect(result.success).toBe(true);
    });

    it('should include success message in response', async () => {
      mockService.markAllAsRead.mockResolvedValue();
      mockI18n.translate.mockReturnValue('All notifications marked as read');

      const result = await controller.markAllAsRead(mockUser);

      expect(result.message).toBe('All notifications marked as read');
    });
  });

  // ─── DELETE /notifications/:id ────────────────────────────────────────────

  describe('deleteNotification', () => {
    it('should delete notification and return success', async () => {
      mockService.deleteNotification.mockResolvedValue();

      const result = await controller.deleteNotification({ id: '507f1f77bcf86cd799439011' });

      expect(mockService.deleteNotification).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result.success).toBe(true);
    });

    it('should include success message in response', async () => {
      mockService.deleteNotification.mockResolvedValue();
      mockI18n.translate.mockReturnValue('Notification deleted successfully');

      const result = await controller.deleteNotification({ id: '507f1f77bcf86cd799439011' });

      expect(result.message).toBe('Notification deleted successfully');
    });
  });
});
