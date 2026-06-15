// utils/user-id.util.spec.ts
import { getUserId, isValidUserId, isOwnProfile } from './user-id.util';
import { IUserProfile } from '../interfaces';

const baseUser: IUserProfile = {
  name: 'John',
  lastname: 'Doe',
  email: 'john@example.com',
  username: 'johndoe',
};

describe('user-id.util', () => {
  // ─── getUserId ───────────────────────────────────────────────────────────────

  describe('getUserId', () => {
    it('should return _id when present', () => {
      const user: IUserProfile = { ...baseUser, _id: 'abc123' };
      expect(getUserId(user)).toBe('abc123');
    });

    it('should return id when _id is absent', () => {
      const user: IUserProfile = { ...baseUser, id: 'xyz789' };
      expect(getUserId(user)).toBe('xyz789');
    });

    it('should prefer _id over id when both are present', () => {
      const user: IUserProfile = { ...baseUser, _id: 'primary', id: 'secondary' };
      expect(getUserId(user)).toBe('primary');
    });

    it('should return null for null input', () => {
      expect(getUserId(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(getUserId(undefined)).toBeNull();
    });

    it('should return null when neither _id nor id is present', () => {
      expect(getUserId(baseUser)).toBeNull();
    });
  });

  // ─── isValidUserId ──────────────────────────────────────────────────────────

  describe('isValidUserId', () => {
    it('should return true for a valid non-empty string', () => {
      expect(isValidUserId('user-001')).toBeTrue();
    });

    it('should return false for null', () => {
      expect(isValidUserId(null)).toBeFalse();
    });

    it('should return false for undefined', () => {
      expect(isValidUserId(undefined)).toBeFalse();
    });

    it('should return false for empty string', () => {
      expect(isValidUserId('')).toBeFalse();
    });

    it('should return false for whitespace-only string', () => {
      expect(isValidUserId('   ')).toBeFalse();
    });
  });

  // ─── isOwnProfile ───────────────────────────────────────────────────────────

  describe('isOwnProfile', () => {
    it('should return true when current user _id matches authUserId', () => {
      const user: IUserProfile = { ...baseUser, _id: 'user-1' };
      expect(isOwnProfile(user, 'user-1')).toBeTrue();
    });

    it('should return true when current user id (not _id) matches authUserId', () => {
      const user: IUserProfile = { ...baseUser, id: 'user-2' };
      expect(isOwnProfile(user, 'user-2')).toBeTrue();
    });

    it('should return false when IDs do not match', () => {
      const user: IUserProfile = { ...baseUser, _id: 'user-1' };
      expect(isOwnProfile(user, 'user-2')).toBeFalse();
    });

    it('should return false when currentUser is null', () => {
      expect(isOwnProfile(null, 'user-1')).toBeFalse();
    });

    it('should return false when authUserId is undefined', () => {
      const user: IUserProfile = { ...baseUser, _id: 'user-1' };
      expect(isOwnProfile(user, undefined)).toBeFalse();
    });

    it('should return false when both are null/undefined', () => {
      expect(isOwnProfile(null, undefined)).toBeFalse();
    });
  });
});
