/**
 * Extract ID from entity (handles both _id and id properties)
 * Reusable across any entity with optional _id or id
 */
export function extractId<T extends { _id?: any; id?: any }>(entity: T): string {
  return (entity._id ?? entity.id) as string;
}

/**
 * Extract multiple IDs from entities
 */
export function extractIds<T extends { _id?: any; id?: any }>(entities: T[]): string[] {
  return entities.map(extractId);
}

/**
 * Find entity by ID (handles both _id and id)
 */
export function findById<T extends { _id?: any; id?: any }>(
  entities: T[],
  id: string
): T | undefined {
  return entities.find(e => extractId(e) === id);
}

/**
 * Find index of entity by ID
 */
export function findIndexById<T extends { _id?: any; id?: any }>(
  entities: T[],
  id: string
): number {
  return entities.findIndex(e => extractId(e) === id);
}

/**
 * Check if entity exists by ID
 */
export function existsById<T extends { _id?: any; id?: any }>(
  entities: T[],
  id: string
): boolean {
  return entities.some(e => extractId(e) === id);
}
