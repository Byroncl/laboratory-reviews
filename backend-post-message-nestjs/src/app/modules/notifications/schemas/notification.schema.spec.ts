import { NotificationType } from './notification.schema';

describe('NotificationSchema', () => {
  describe('NotificationType enum', () => {
    it('should expose COMMENT_CREATED value', () => {
      expect(NotificationType.COMMENT_CREATED).toBe('comment_created');
    });

    it('should expose REPLY_CREATED value', () => {
      expect(NotificationType.REPLY_CREATED).toBe('reply_created');
    });

    it('should expose REACTION_ADDED value', () => {
      expect(NotificationType.REACTION_ADDED).toBe('reaction_added');
    });

    it('should expose USER_JOINED value', () => {
      expect(NotificationType.USER_JOINED).toBe('user_joined');
    });

    it('should contain exactly 4 notification types', () => {
      const values = Object.values(NotificationType);
      expect(values).toHaveLength(4);
    });
  });
});
