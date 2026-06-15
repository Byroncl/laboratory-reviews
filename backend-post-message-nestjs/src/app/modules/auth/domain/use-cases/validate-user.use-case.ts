import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from '../repositories/auth.repository';
import { User } from '../../schemas/user.schema';
import { I18nService } from '../../../../core/i18n/i18n.service';

/**
 * Use case for validating user credentials.
 * Responsible for verifying username and password and returning the user if valid.
 */
@Injectable()
export class ValidateUserUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly i18nService: I18nService,
  ) {}

  /**
   * Execute the validate user operation.
   * @param username - The username to validate
   * @param password - The password to verify
   * @returns The user object if credentials are valid
   * @throws UnauthorizedException if credentials are invalid
   */
  async execute(username: string, password: string): Promise<User | null> {
    try {
      const user = await this.authRepository.validateCredentials(
        username,
        password,
      );

      if (!user) {
        throw new UnauthorizedException(
          this.i18nService.translate('auth.invalid_credentials'),
        );
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException(
        this.i18nService.translate('auth.login_failed'),
      );
    }
  }
}
