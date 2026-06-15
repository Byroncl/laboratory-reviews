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
   * @param type - Optional: force validation for specific type ('user' or 'client')
   * @returns Object with user/client data and type, or null if invalid
   */
  async validateCredentials(
    username: string,
    password: string,
    type?: 'user' | 'client',
  ): Promise<{ data: any; type: 'user' | 'client' } | null> {
    this.logger.debug(`validateCredentials called for username: ${username}, type: ${type || 'auto'}`);

    // If type is specified, validate only that type
    if (type === 'user') {
      try {
        this.logger.debug(`Validating as user (forced)...`);
        const user = await this.validateUserUseCase.execute(username, password);
        this.logger.debug(`User validation result: ${user ? 'valid' : 'null'}`);
        if (user) {
          return { data: user, type: 'user' };
        }
      } catch (error) {
        this.logger.debug(`User validation threw error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      return null;
    }

    if (type === 'client') {
      if (this.clientRepository) {
        try {
          this.logger.debug(`Validating as client (forced)...`);
          const client = await this.clientRepository.findByUsername(username);
          this.logger.debug(`Client found: ${client ? 'yes' : 'no'}`);
          if (!client) {
            this.logger.debug(`Client not found for username: ${username}`);
            return null;
          }
          if (!client.password_hash) {
            this.logger.debug(`Client has no password_hash`);
            return null;
          }
          this.logger.debug(`Comparing password. Hash length: ${client.password_hash?.length}`);
          const isPasswordValid = await CryptoUtils.comparePasswords(password, client.password_hash);
          this.logger.debug(`Client password valid: ${isPasswordValid}`);
          if (isPasswordValid) {
            return { data: client, type: 'client' };
          }
          this.logger.debug(`Password mismatch for client ${username}`);
        } catch (error) {
          this.logger.debug(`Client validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      return null;
    }

    // Auto-detect: try user first, then client
    try {
      this.logger.debug(`Attempting to validate as user...`);
      const user = await this.validateUserUseCase.execute(username, password);
      this.logger.debug(`User validation result: ${user ? 'valid' : 'null'}`);
      if (user) {
        return { data: user, type: 'user' };
      }
    } catch (error) {
      this.logger.debug(`User validation threw error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    if (this.clientRepository) {
      try {
        this.logger.debug(`Attempting to validate as client...`);
        const client = await this.clientRepository.findByUsername(username);
        this.logger.debug(`Client found: ${client ? 'yes' : 'no'}`);
        if (!client) {
          this.logger.debug(`Client not found for username: ${username}`);
        } else if (!client.password_hash) {
          this.logger.debug(`Client has no password_hash`);
        } else {
          this.logger.debug(`Comparing password. Hash length: ${client.password_hash?.length}`);
          const isPasswordValid = await CryptoUtils.comparePasswords(password, client.password_hash);
          this.logger.debug(`Client password valid: ${isPasswordValid}`);
          if (isPasswordValid) {
            return { data: client, type: 'client' };
          }
          this.logger.debug(`Password mismatch for client ${username}`);
        }
      } catch (error) {
        this.logger.debug(`Client validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    this.logger.debug(`No valid credentials found for ${username}`);
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
   * @param userObject - The validated user object (already authenticated)
   * @returns Login response with access token and user data
   */
  async login(userObject: any): Promise<LoginResponse & { user?: any }> {
    const payload = await this.loginUseCase.executeFromUser(userObject);
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userObject._id,
        username: userObject.username,
        email: userObject.email,
        name: userObject.name,
        type: userObject.type,
      },
    };
  }
}
