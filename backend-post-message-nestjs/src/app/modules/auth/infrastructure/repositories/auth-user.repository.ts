import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { CryptoUtils } from '../../../../core/utils/crypto.utils';
import { User } from '../../schemas/user.schema';

/**
 * Concrete implementation of AuthRepository using UserRepository and MongoDB.
 * Handles authentication-specific operations against the User collection.
 */
@Injectable()
export class AuthUserRepository implements AuthRepository {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Validate user credentials by checking username and password.
   * @param username - The username to look up
   * @param password - The plain text password to verify against the hash
   * @returns User object if credentials match, null otherwise
   */
  async validateCredentials(
    username: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.userRepository.findOneByUsername(username);

    if (!user) {
      return null;
    }

    const isPasswordValid = await CryptoUtils.comparePasswords(
      password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Find a user by username.
   * @param username - The username to search for
   * @returns User object or null if not found
   */
  async findUserByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOneByUsername(username);
  }

  /**
   * Record a login attempt (updates last login timestamp).
   * @param userId - The user ID
   */
  async recordLoginAttempt(userId: string): Promise<void> {
    // This will update the lastLoginAt field in the user document
    await this.userRepository.updateLastLogin(userId);
  }
}
