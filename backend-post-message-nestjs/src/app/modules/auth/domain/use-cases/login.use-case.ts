import { Injectable, BadRequestException } from '@nestjs/common';
import { AuthRepository } from '../repositories/auth.repository';
import { JwtPayload } from '../../../../core/interfaces/auth.interface';
import { AuthRole } from '../../../../core/types/common.types';
import { I18nService } from '../../../../core/i18n/i18n.service';

/**
 * Use case for generating JWT payload from user data.
 * Responsible for creating the JWT payload with user information and role.
 */
@Injectable()
export class LoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly i18nService: I18nService,
  ) {}

  /**
   * Execute the login operation.
   * @param username - The username
   * @param password - The password (plain text, will be validated by repository)
   * @returns JWT payload for signing
   * @throws BadRequestException if user cannot be found or validated
   */
  async execute(username: string, password: string): Promise<JwtPayload> {
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
      const payload: JwtPayload = {
        username: user.username,
        sub: user._id.toString(),
        type: (user.type as AuthRole) || 'user',
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
