import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { AuthRepository } from '../repositories/auth.repository';
import { JwtPayload } from '../../../../core/interfaces/auth.interface';
import { AuthRole } from '../../../../core/types/common.types';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { User } from '../../schemas/user.schema';

/**
 * Use case for generating JWT payload from validated user data.
 * Responsible for creating the JWT payload with user information and role.
 * Note: User validation should happen BEFORE calling this use case.
 */
@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger('LoginUseCase');

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly i18nService: I18nService,
  ) {}

  /**
   * Execute the login operation with an already-validated user.
   * @param user - The validated user object (already authenticated)
   * @returns JWT payload for signing
   * @throws BadRequestException if user data is invalid
   */
  async executeFromUser(user: User): Promise<JwtPayload> {
    try {
      if (!user || !user._id) {
        throw new BadRequestException(
          this.i18nService.translate('auth.user_not_found'),
        );
      }

      this.logger.debug(`Creating JWT payload for user: ${user.username}`);

      // Record successful login attempt
      await this.authRepository.recordLoginAttempt(user._id.toString());

      // Create JWT payload
      // Include role identifier if available, otherwise fall back to type
      const roleIdentifier = user.role?.identifier || (user.type as AuthRole) || 'user';

      const payload: JwtPayload = {
        username: user.username,
        sub: user._id.toString(),
        type: (user.type as AuthRole) || 'user',
        role: roleIdentifier,
      };

      return payload;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        this.i18nService.translate('auth.login_failed'),
      );
    }
  }

  /**
   * Legacy method: Execute the login operation by validating credentials.
   * Credentials validation happens within this method.
   * @param username - The username
   * @param password - The password (plain text)
   * @returns JWT payload for signing
   * @throws BadRequestException if validation fails
   */
  async execute(username: string, password: string): Promise<JwtPayload> {
    this.logger.debug(`LoginUseCase.execute called (legacy method)`);
    try {
      const user = await this.authRepository.validateCredentials(
        username,
        password,
      );

      if (!user || !user._id) {
        throw new BadRequestException(
          this.i18nService.translate('auth.user_not_found'),
        );
      }

      // Record successful login attempt
      await this.authRepository.recordLoginAttempt(user._id.toString());

      // Create JWT payload
      // Include role identifier if available, otherwise fall back to type
      const roleIdentifier = user.role?.identifier || (user.type as AuthRole) || 'user';

      const payload: JwtPayload = {
        username: user.username,
        sub: user._id.toString(),
        type: (user.type as AuthRole) || 'user',
        role: roleIdentifier,
      };

      return payload;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        this.i18nService.translate('auth.login_failed'),
      );
    }
  }
}
