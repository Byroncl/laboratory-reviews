import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginResponse } from '../../../core/interfaces/auth.interface';
import { ValidateUserUseCase } from '../domain/use-cases/validate-user.use-case';
import { LoginUseCase } from '../domain/use-cases/login.use-case';

/**
 * Auth Service acts as an orchestrator that delegates to use cases.
 * Orchestrates authentication operations: validation, login, and JWT generation.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly validateUserUseCase: ValidateUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate user credentials.
   * @param username - The username
   * @param password - The password
   * @returns User object if valid, null otherwise
   */
  async validateUser(username: string, password: string): Promise<any> {
    try {
      return await this.validateUserUseCase.execute(username, password);
    } catch (error) {
      return null;
    }
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
