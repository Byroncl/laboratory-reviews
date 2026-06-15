import { IPost, IComment, IPostFilters, ICommentFilters } from '../interfaces';

/**
 * Filters posts by search term (title + content + author)
 */
export function filterPostsBySearchTerm(posts: IPost[], searchTerm: string): IPost[] {
  if (!searchTerm || !searchTerm.trim()) {
    return posts;
  }

  const term = searchTerm.toLowerCase();
  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(term) ||
      post.content.toLowerCase().includes(term) ||
      post.author.toLowerCase().includes(term),
  );
}

/**
 * Filters posts by status
 */
export function filterPostsByStatus(posts: IPost[], status: string | undefined): IPost[] {
  if (!status) return posts;
  return posts.filter((post) => post.status === status);
}

/**
 * Filters posts by author
 */
export function filterPostsByAuthor(posts: IPost[], author: string | undefined): IPost[] {
  if (!author) return posts;
  return posts.filter((post) => post.author.toLowerCase() === author.toLowerCase());
}

/**
 * Filters posts by date range
 */
export function filterPostsByDateRange(
  posts: IPost[],
  dateFrom?: Date,
  dateTo?: Date,
): IPost[] {
  return posts.filter((post) => {
    if (!post.createdAt) return true;
    const postDate = new Date(post.createdAt);
    if (dateFrom && postDate < dateFrom) return false;
    if (dateTo && postDate > dateTo) return false;
    return true;
  });
}

/**
 * Filters posts by tags (any tag match)
 */
export function filterPostsByTags(posts: IPost[], tags: string[] | undefined): IPost[] {
  if (!tags || tags.length === 0) return posts;
  return posts.filter((post) => {
    if (!post.tags) return false;
    return tags.some((tag) => post.tags!.includes(tag));
  });
}

/**
 * Applies all post filters in composition (like admin module pattern)
 */
export function applyPostFilters(posts: IPost[], filters: IPostFilters): IPost[] {
  let result = posts;
  result = filterPostsBySearchTerm(result, filters.searchTerm || '');
  result = filterPostsByStatus(result, filters.status);
  result = filterPostsByAuthor(result, filters.author);
  result = filterPostsByDateRange(result, filters.dateFrom, filters.dateTo);
  result = filterPostsByTags(result, filters.tags);
  return result;
}

/**
 * Filters comments by search term (content + author)
 */
export function filterCommentsBySearchTerm(comments: IComment[], searchTerm: string): IComment[] {
  if (!searchTerm || !searchTerm.trim()) {
    return comments;
  }

  const term = searchTerm.toLowerCase();
  return comments.filter(
    (comment) =>
      comment.content.toLowerCase().includes(term) ||
      (comment.author?.toLowerCase().includes(term) ?? false),
  );
}

/**
 * Filters comments by author
 */
export function filterCommentsByAuthor(
  comments: IComment[],
  author: string | undefined,
): IComment[] {
  if (!author) return comments;
  return comments.filter((comment) => comment.author?.toLowerCase() === author.toLowerCase());
}

/**
 * Filters comments by post ID
 */
export function filterCommentsByPostId(
  comments: IComment[],
  postId: string | undefined,
): IComment[] {
  if (!postId) return comments;
  return comments.filter((comment) => comment.post === postId);
}

/**
 * Filters comments by date range
 */
export function filterCommentsByDateRange(
  comments: IComment[],
  dateFrom?: Date,
  dateTo?: Date,
): IComment[] {
  return comments.filter((comment) => {
    if (!comment.createdAt) return true;
    const commentDate = new Date(comment.createdAt);
    if (dateFrom && commentDate < dateFrom) return false;
    if (dateTo && commentDate > dateTo) return false;
    return true;
  });
}

/**
 * Applies all comment filters in composition
 */
export function applyCommentFilters(comments: IComment[], filters: ICommentFilters): IComment[] {
  let result = comments;
  result = filterCommentsBySearchTerm(result, filters.searchTerm || '');
  result = filterCommentsByAuthor(result, filters.author);
  result = filterCommentsByPostId(result, filters.postId);
  result = filterCommentsByDateRange(result, filters.dateFrom, filters.dateTo);
  return result;
}
