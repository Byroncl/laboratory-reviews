import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from '../repositories/auth.repository';
import { User } from '../../schemas/user.schema';
import { I18nService } from '../../../../core/i18n/i18n.service';

/**
 * Use case for validating user credentials.
 * Responsible for verifying username and password and returning the user if valid.
 */
@Injectable()
export class ValidateUserUseCase {
  private readonly logger = new Logger('ValidateUserUseCase');

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
    this.logger.debug(`ValidateUserUseCase.execute called for username: ${username}`);
    try {
      const user = await this.authRepository.validateCredentials(
        username,
        password,
      );
      this.logger.debug(`AuthRepository.validateCredentials returned: ${user ? 'user found' : 'null'}`);
      return user || null;
    } catch (error) {
      this.logger.debug(`AuthRepository.validateCredentials threw error: ${error instanceof Error ? error.message : 'Unknown'}`);
      return null;
    }
  }
}
