import { filterPosts } from './home-post.utils';
import { PostViewModel } from '../types';

const makePosts = (): PostViewModel[] => [
  { id: '1', title: 'Angular Guide', preview: 'Intro to Angular framework', authorUsername: 'alice', createdAt: '2024-01-01T00:00:00Z' },
  { id: '2', title: 'React Tutorial', preview: 'Getting started with React', authorUsername: 'bob', createdAt: '2024-01-02T00:00:00Z' },
  { id: '3', title: 'Vue Basics', preview: 'Vue component model explained', authorUsername: 'carol', createdAt: '2024-01-03T00:00:00Z' },
];

describe('filterPosts', () => {
  it('returns all posts when query is empty', () => {
    const posts = makePosts();
    expect(filterPosts(posts, '')).toEqual(posts);
  });

  it('returns all posts when query is only whitespace', () => {
    const posts = makePosts();
    expect(filterPosts(posts, '   ')).toEqual(posts);
  });

  it('filters by title match (case-insensitive)', () => {
    const result = filterPosts(makePosts(), 'angular');
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('1');
  });

  it('filters by preview match (case-insensitive)', () => {
    const result = filterPosts(makePosts(), 'react');
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('2');
  });

  it('matches across multiple posts when query applies to several', () => {
    // Both title "Vue Basics" and preview "Vue component model" match 'vue'
    const result = filterPosts(makePosts(), 'vue');
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('3');
  });

  it('returns empty array when no posts match', () => {
    const result = filterPosts(makePosts(), 'xxxxxxxxxx');
    expect(result).toEqual([]);
  });

  it('is case-insensitive for mixed-case query', () => {
    const result = filterPosts(makePosts(), 'ANGULAR');
    expect(result.length).toBe(1);
  });

  it('does not mutate the original array', () => {
    const posts = makePosts();
    const original = [...posts];
    filterPosts(posts, 'angular');
    expect(posts).toEqual(original);
  });
});
