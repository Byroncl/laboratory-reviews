import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger('LocalStrategy');

  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
    this.logger.log('✓ LocalStrategy initialized');
  }

  async validate(username: string, password: string): Promise<any> {
    this.logger.debug(`Attempting to validate user: ${username}`);
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      this.logger.warn(`Validation failed for user: ${username}`);
      return null;
    }
    this.logger.log(`✓ User ${username} validated successfully`);
    return user;
  }
}
