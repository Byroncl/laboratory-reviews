// utils/entity-id.util.spec.ts
import { getPostId, getCommentId, isValidPostId, isValidCommentId } from './entity-id.util';
import { IPost, IComment } from '../interfaces';

describe('entity-id.util', () => {

  // ─── getPostId ──────────────────────────────────────────────────────────────

  describe('getPostId', () => {
    it('should return _id when present', () => {
      const post: IPost = { _id: 'abc123', title: 'T', content: 'B', author: 'A', status: 'draft' };
      expect(getPostId(post)).toBe('abc123');
    });

    it('should return id when _id is absent', () => {
      const post: IPost = { id: 'xyz789', title: 'T', content: 'B', author: 'A', status: 'draft' };
      expect(getPostId(post)).toBe('xyz789');
    });

    it('should prefer _id over id when both are present', () => {
      const post: IPost = { _id: 'primary', id: 'secondary', title: 'T', content: 'B', author: 'A', status: 'draft' };
      expect(getPostId(post)).toBe('primary');
    });

    it('should return null for null input', () => {
      expect(getPostId(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(getPostId(undefined)).toBeNull();
    });

    it('should return null when both _id and id are absent', () => {
      const post: IPost = { title: 'T', content: 'B', author: 'A', status: 'draft' };
      expect(getPostId(post)).toBeNull();
    });
  });

  // ─── getCommentId ───────────────────────────────────────────────────────────

  describe('getCommentId', () => {
    it('should return _id when present', () => {
      const comment: IComment = { _id: 'c1', post: 'p1', content: 'Hi' };
      expect(getCommentId(comment)).toBe('c1');
    });

    it('should return id when _id is absent', () => {
      const comment: IComment = { id: 'c2', post: 'p1', content: 'Hey' };
      expect(getCommentId(comment)).toBe('c2');
    });

    it('should return null for null input', () => {
      expect(getCommentId(null)).toBeNull();
    });
  });

  // ─── isValidPostId ──────────────────────────────────────────────────────────

  describe('isValidPostId', () => {
    it('should return true for a valid non-empty string', () => {
      expect(isValidPostId('abc')).toBeTrue();
    });

    it('should return false for null', () => {
      expect(isValidPostId(null)).toBeFalse();
    });

    it('should return false for undefined', () => {
      expect(isValidPostId(undefined)).toBeFalse();
    });

    it('should return false for empty string', () => {
      expect(isValidPostId('')).toBeFalse();
    });

    it('should return false for whitespace-only string', () => {
      expect(isValidPostId('   ')).toBeFalse();
    });
  });

  // ─── isValidCommentId ───────────────────────────────────────────────────────

  describe('isValidCommentId', () => {
    it('should return true for a valid string', () => {
      expect(isValidCommentId('comment-1')).toBeTrue();
    });

    it('should return false for null', () => {
      expect(isValidCommentId(null)).toBeFalse();
    });
  });
});
