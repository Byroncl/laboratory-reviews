import { IPost } from '../interfaces';
import { IComment } from '../interfaces';

/**
 * Extracts the ID from a post entity, checking both _id and id fields
 * Matches the admin module pattern for entity-id extraction
 */
export function getPostId(post: IPost | null | undefined): string | null {
  if (!post) return null;
  return post._id || post.id || null;
}

/**
 * Extracts the ID from a comment entity
 */
export function getCommentId(comment: IComment | null | undefined): string | null {
  if (!comment) return null;
  return comment._id || comment.id || null;
}

/**
 * Checks if a post ID is valid (not null/undefined/empty)
 */
export function isValidPostId(id: string | null | undefined): id is string {
  return Boolean(id && id.trim());
}

/**
 * Checks if a comment ID is valid
 */
export function isValidCommentId(id: string | null | undefined): id is string {
  return Boolean(id && id.trim());
}
