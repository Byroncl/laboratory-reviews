import { PostViewModel } from '../types';

/**
 * Filters a list of PostViewModel items by a search query string.
 * Checks both `title` and `preview` fields case-insensitively.
 * Returns the full list when query is empty.
 */
export function filterPosts(posts: PostViewModel[], query: string): PostViewModel[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return posts;
  return posts.filter(
    post =>
      post.title.toLowerCase().includes(normalized) ||
      post.preview.toLowerCase().includes(normalized)
  );
}
