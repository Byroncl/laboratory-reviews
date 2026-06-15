import { User } from '../../schemas/user.schema';

/**
 * Abstract repository for authentication operations.
 * Defines the contract for auth-specific data access logic.
 */
export abstract class AuthRepository {
  /**
   * Validate user credentials (username and password).
   * @param username - The user's username
   * @param password - The plain text password to validate
   * @returns The user object if credentials are valid, null otherwise
   */
  abstract validateCredentials(
    username: string,
    password: string,
  ): Promise<User | null>;

  /**
   * Find a user by username.
   * @param username - The username to search for
   * @returns The user object or null if not found
   */
  abstract findUserByUsername(username: string): Promise<User | null>;

  /**
   * Record a login attempt for audit/security purposes.
   * @param userId - The ID of the user who logged in
   */
  abstract recordLoginAttempt(userId: string): Promise<void>;
}
