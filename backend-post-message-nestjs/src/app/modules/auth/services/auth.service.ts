import { Injectable, Logger, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginResponse } from '../../../core/interfaces/auth.interface';
import { ValidateUserUseCase } from '../domain/use-cases/validate-user.use-case';
import { LoginUseCase } from '../domain/use-cases/login.use-case';
import { ClientRepository } from '../../clients/infrastructure/repositories/client.repository';
import { CryptoUtils } from '../../../core/utils/crypto.utils';

/**
 * Auth Service acts as an orchestrator that delegates to use cases.
 * Orchestrates authentication operations: validation, login, and JWT generation.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly validateUserUseCase: ValidateUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly jwtService: JwtService,
    @Inject(ClientRepository) private readonly clientRepository?: ClientRepository,
  ) {}

  /**
   * Validate user or client credentials.
   * @param username - The username
   * @param password - The password
   * @returns Object with user/client data and type, or null if invalid
   */
  async validateCredentials(username: string, password: string): Promise<{ data: any; type: 'user' | 'client' } | null> {
    try {
      const user = await this.validateUserUseCase.execute(username, password);
      if (user) {
        return { data: user, type: 'user' };
      }
    } catch (error) {
      this.logger.debug(`User validation failed for ${username}`);
    }

    if (this.clientRepository) {
      try {
        const client = await this.clientRepository.findByUsername(username);
        if (client && client.password_hash) {
          const isPasswordValid = await CryptoUtils.comparePasswords(password, client.password_hash);
          if (isPasswordValid) {
            return { data: client, type: 'client' };
          }
        }
      } catch (error) {
        this.logger.debug(`Client validation failed for ${username}`);
      }
    }

    return null;
  }

  /**
   * Legacy validate user method for backwards compatibility
   */
  async validateUser(username: string, password: string): Promise<any> {
    const result = await this.validateCredentials(username, password);
    return result?.data || null;
  }

  /**
   * Perform login: generate JWT payload and sign it.
   * @param userObject - The user object (from LocalStrategy validation)
   * @returns Login response with access token
   */
  async login(userObject: any): Promise<LoginResponse> {
    const payload = await this.loginUseCase.execute(
      userObject.username,
      userObject.password || '',
    );
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
