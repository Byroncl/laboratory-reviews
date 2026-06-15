// utils/filter.util.spec.ts
import {
  filterPostsBySearchTerm,
  filterPostsByStatus,
  filterPostsByAuthor,
  filterPostsByDateRange,
  filterPostsByTags,
  applyPostFilters,
  filterCommentsBySearchTerm,
  filterCommentsByAuthor,
  filterCommentsByPostId,
  filterCommentsByDateRange,
  applyCommentFilters,
} from './filter.util';
import { IPost, IComment } from '../interfaces';

const makePosts = (): IPost[] => [
  {
    _id: '1',
    title: 'Angular Guide',
    content: 'Learning Angular framework',
    author: 'Alice',
    status: 'published',
    createdAt: new Date('2024-03-15'),
    tags: ['angular', 'frontend'],
  },
  {
    _id: '2',
    title: 'NestJS API',
    content: 'Building REST APIs with NestJS',
    author: 'Bob',
    status: 'draft',
    createdAt: new Date('2024-01-10'),
    tags: ['nestjs', 'backend'],
  },
  {
    _id: '3',
    title: 'TypeScript Tips',
    content: 'Advanced TypeScript patterns',
    author: 'Alice',
    status: 'archived',
    createdAt: new Date('2024-05-20'),
    tags: ['typescript'],
  },
];

const makeComments = (): IComment[] => [
  {
    _id: 'c1',
    post: 'post-1',
    author: 'John Doe',
    content: 'Great article!',
    createdAt: new Date('2024-02-01'),
  },
  {
    _id: 'c2',
    post: 'post-2',
    author: 'Jane Smith',
    content: 'Very helpful content',
    createdAt: new Date('2024-04-10'),
  },
  {
    _id: 'c3',
    post: 'post-1',
    author: 'Bob Brown',
    content: 'Thanks for the info',
    createdAt: new Date('2024-06-05'),
  },
];

describe('filter.util', () => {

  // ─── filterPostsBySearchTerm ─────────────────────────────────────────────────

  describe('filterPostsBySearchTerm', () => {
    it('should match by title', () => {
      const result = filterPostsBySearchTerm(makePosts(), 'Angular');
      expect(result.length).toBe(1);
      expect(result[0]._id).toBe('1');
    });

    it('should match by content', () => {
      const result = filterPostsBySearchTerm(makePosts(), 'REST APIs');
      expect(result.length).toBe(1);
      expect(result[0]._id).toBe('2');
    });

    it('should match by author', () => {
      const result = filterPostsBySearchTerm(makePosts(), 'alice');
      expect(result.length).toBe(2);
    });

    it('should return all posts when term is empty', () => {
      const result = filterPostsBySearchTerm(makePosts(), '');
      expect(result.length).toBe(3);
    });

    it('should return empty array when no match', () => {
      const result = filterPostsBySearchTerm(makePosts(), 'zzz-no-match');
      expect(result.length).toBe(0);
    });

    it('should be case insensitive', () => {
      const result = filterPostsBySearchTerm(makePosts(), 'ANGULAR');
      expect(result.length).toBe(1);
    });
  });

  // ─── filterPostsByStatus ─────────────────────────────────────────────────────

  describe('filterPostsByStatus', () => {
    it('should filter by exact status', () => {
      const result = filterPostsByStatus(makePosts(), 'published');
      expect(result.length).toBe(1);
      expect(result[0]._id).toBe('1');
    });

    it('should return all posts when status is undefined', () => {
      const result = filterPostsByStatus(makePosts(), undefined);
      expect(result.length).toBe(3);
    });

    it('should return only matching posts', () => {
      const result = filterPostsByStatus(makePosts(), 'draft');
      result.forEach(p => expect(p.status).toBe('draft'));
    });
  });

  // ─── filterPostsByAuthor ─────────────────────────────────────────────────────

  describe('filterPostsByAuthor', () => {
    it('should filter by author case-insensitively', () => {
      const result = filterPostsByAuthor(makePosts(), 'alice');
      expect(result.length).toBe(2);
    });

    it('should return empty array when no posts match the author', () => {
      const result = filterPostsByAuthor(makePosts(), 'Charlie');
      expect(result.length).toBe(0);
    });

    it('should return all posts when author is undefined', () => {
      const result = filterPostsByAuthor(makePosts(), undefined);
      expect(result.length).toBe(3);
    });
  });

  // ─── filterPostsByDateRange ──────────────────────────────────────────────────

  describe('filterPostsByDateRange', () => {
    it('should include posts within range', () => {
      const result = filterPostsByDateRange(
        makePosts(),
        new Date('2024-01-01'),
        new Date('2024-04-01'),
      );
      expect(result.length).toBe(2);
    });

    it('should exclude posts before dateFrom', () => {
      const result = filterPostsByDateRange(makePosts(), new Date('2024-02-01'), undefined);
      expect(result.some(p => p._id === '2')).toBeFalse();
    });

    it('should exclude posts after dateTo', () => {
      const result = filterPostsByDateRange(makePosts(), undefined, new Date('2024-04-01'));
      expect(result.some(p => p._id === '3')).toBeFalse();
    });

    it('should apply both bounds together', () => {
      const result = filterPostsByDateRange(
        makePosts(),
        new Date('2024-03-01'),
        new Date('2024-04-01'),
      );
      expect(result.length).toBe(1);
      expect(result[0]._id).toBe('1');
    });

    it('should include post without createdAt', () => {
      const postWithoutDate: IPost = { _id: '9', title: 'T', content: 'B', author: 'A', status: 'draft' };
      const result = filterPostsByDateRange(
        [postWithoutDate],
        new Date('2024-01-01'),
        new Date('2024-12-31'),
      );
      expect(result.length).toBe(1);
    });

    it('should return all posts when no bounds are provided', () => {
      const result = filterPostsByDateRange(makePosts(), undefined, undefined);
      expect(result.length).toBe(3);
    });
  });

  // ─── filterPostsByTags ───────────────────────────────────────────────────────

  describe('filterPostsByTags', () => {
    it('should return posts that have a matching tag', () => {
      const result = filterPostsByTags(makePosts(), ['angular']);
      expect(result.length).toBe(1);
      expect(result[0]._id).toBe('1');
    });

    it('should return all posts when tags is undefined', () => {
      const result = filterPostsByTags(makePosts(), undefined);
      expect(result.length).toBe(3);
    });

    it('should return all posts when tags array is empty', () => {
      const result = filterPostsByTags(makePosts(), []);
      expect(result.length).toBe(3);
    });

    it('should exclude post with no tags field', () => {
      const postNoTags: IPost = { _id: '10', title: 'T', content: 'B', author: 'A', status: 'draft' };
      const result = filterPostsByTags([postNoTags], ['angular']);
      expect(result.length).toBe(0);
    });
  });

  // ─── applyPostFilters ────────────────────────────────────────────────────────

  describe('applyPostFilters', () => {
    it('should compose all filters', () => {
      const result = applyPostFilters(makePosts(), {
        searchTerm: 'Angular',
        author: 'Alice',
        status: 'published',
      });
      expect(result.length).toBe(1);
      expect(result[0]._id).toBe('1');
    });

    it('should return all posts when filters object is empty', () => {
      const result = applyPostFilters(makePosts(), {});
      expect(result.length).toBe(3);
    });
  });

  // ─── filterCommentsBySearchTerm ──────────────────────────────────────────────

  describe('filterCommentsBySearchTerm', () => {
    it('should match by author', () => {
      const result = filterCommentsBySearchTerm(makeComments(), 'John');
      expect(result.some(c => c._id === 'c1')).toBeTrue();
    });

    it('should match by content', () => {
      const result = filterCommentsBySearchTerm(makeComments(), 'Very helpful');
      expect(result.length).toBe(1);
      expect(result[0]._id).toBe('c2');
    });

    it('should return all when search term is empty', () => {
      const result = filterCommentsBySearchTerm(makeComments(), '');
      expect(result.length).toBe(3);
    });

    it('should return empty when no match', () => {
      const result = filterCommentsBySearchTerm(makeComments(), 'zzz-no-match');
      expect(result.length).toBe(0);
    });
  });

  // ─── filterCommentsByAuthor ───────────────────────────────────────────────────

  describe('filterCommentsByAuthor', () => {
    it('should filter by author case-insensitively', () => {
      const result = filterCommentsByAuthor(makeComments(), 'JOHN DOE');
      expect(result.length).toBe(1);
      expect(result[0]._id).toBe('c1');
    });

    it('should return all when author is undefined', () => {
      const result = filterCommentsByAuthor(makeComments(), undefined);
      expect(result.length).toBe(3);
    });
  });

  // ─── filterCommentsByPostId ──────────────────────────────────────────────────

  describe('filterCommentsByPostId', () => {
    it('should filter comments by post id', () => {
      const result = filterCommentsByPostId(makeComments(), 'post-1');
      expect(result.length).toBe(2);
    });

    it('should return all when postId is undefined', () => {
      const result = filterCommentsByPostId(makeComments(), undefined);
      expect(result.length).toBe(3);
    });
  });

  // ─── filterCommentsByDateRange ───────────────────────────────────────────────

  describe('filterCommentsByDateRange', () => {
    it('should include comments within range', () => {
      const result = filterCommentsByDateRange(
        makeComments(),
        new Date('2024-01-01'),
        new Date('2024-03-01'),
      );
      expect(result.length).toBe(1);
      expect(result[0]._id).toBe('c1');
    });

    it('should include comment without createdAt', () => {
      const c: IComment = { _id: 'cx', post: 'p1', content: 'B' };
      const result = filterCommentsByDateRange([c], new Date('2024-01-01'), new Date('2024-12-31'));
      expect(result.length).toBe(1);
    });
  });

  // ─── applyCommentFilters ─────────────────────────────────────────────────────

  describe('applyCommentFilters', () => {
    it('should compose all comment filters', () => {
      const result = applyCommentFilters(makeComments(), {
        postId: 'post-1',
        author: 'John Doe',
      });
      expect(result.length).toBe(1);
      expect(result[0]._id).toBe('c1');
    });

    it('should return all when filters object is empty', () => {
      const result = applyCommentFilters(makeComments(), {});
      expect(result.length).toBe(3);
    });
  });
});
