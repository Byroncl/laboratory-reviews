import { IUserProfile } from '../interfaces';

/**
 * Extracts the ID from a user profile entity, checking both _id and id fields.
 * Matches the posts module entity-id pattern.
 */
export function getUserId(user: IUserProfile | null | undefined): string | null {
  if (!user) return null;
  return (user._id ?? user.id ?? null) as string | null;
}

/**
 * Checks if a user ID is valid (not null/undefined/empty).
 */
export function isValidUserId(id: string | null | undefined): id is string {
  return Boolean(id && String(id).trim());
}

/**
 * Checks if the given user is the same as the authenticated user.
 */
export function isOwnProfile(
  currentUser: IUserProfile | null | undefined,
  authUserId?: string,
): boolean {
  if (!currentUser || !authUserId) return false;
  return getUserId(currentUser) === authUserId;
}
