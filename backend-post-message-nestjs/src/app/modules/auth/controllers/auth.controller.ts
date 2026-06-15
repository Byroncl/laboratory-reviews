import { Controller, Post, Body, BadRequestException, Inject } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse as ApiResDecorator,
  ApiHeader,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AuditActionDecorator } from '../../../core/decorators/audit-action.decorator';
import { AuditAction, EntityType } from '../../audit/schemas/audit-log.schema';
import {
  AUTH_SWAGGER,
  AUTH_RESPONSE_DESCRIPTIONS,
  AUTH_EXAMPLES,
} from '../constants/auth.constants';
import { ClientRepository } from '../../clients/infrastructure/repositories/client.repository';
import { CryptoUtils } from '../../../core/utils/crypto.utils';

@ApiTags('auth')
@ApiHeader({
  name: 'Accept-Language',
  description: 'Language preference: en (English) or es (Spanish)',
  required: false,
  example: 'es',
})
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly i18n: I18nService,
    @Inject(ClientRepository) private readonly clientRepository: ClientRepository,
  ) {}

  @AuditActionDecorator(AuditAction.LOGIN, EntityType.USER)
  @ApiOperation(AUTH_SWAGGER.LOGIN)
  @ApiBody({ type: LoginDto })
  @ApiResDecorator({
    status: 200,
    description: AUTH_RESPONSE_DESCRIPTIONS.LOGIN_SUCCESS,
    type: AuthResponseDto,
    example: { data: AUTH_EXAMPLES.LOGIN_RESPONSE },
  })
  @ApiResDecorator({
    status: 401,
    description: AUTH_RESPONSE_DESCRIPTIONS.LOGIN_FAILED,
    example: AUTH_EXAMPLES.ERROR_INVALID_CREDENTIALS,
  })
  @Post('login')
  async login(@Body() credentials: LoginDto) {
    const result = await this.authService.validateCredentials(
      credentials.username,
      credentials.password,
    );
    if (!result) {
      throw new BadRequestException(
        this.i18n.translate('auth.invalid_credentials'),
      );
    }
    const loginResponse = await this.authService.login(result.data);
    return {
      access_token: loginResponse.access_token,
      user: loginResponse.user,
      userType: result.type,
      expiresIn: 86400, // 24 hours in seconds
    };
  }

  @AuditActionDecorator(AuditAction.LOGIN, EntityType.USER)
  @ApiOperation({
    summary: 'Register new user or client',
    description: 'Register a new user or client account',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResDecorator({
    status: 201,
    description: 'User or client registered successfully',
    type: AuthResponseDto,
  })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    if (registerDto.type === 'user') {
      // TODO: Implement user registration
      throw new BadRequestException('User registration not yet implemented');
    } else if (registerDto.type === 'client') {
      // Register as client
      const hashedPassword = await CryptoUtils.hashPassword(registerDto.password);

      // Check if username or email already exists
      const existingClient = await this.clientRepository.findByUsername(registerDto.username);
      if (existingClient) {
        throw new BadRequestException(
          this.i18n.translate('auth.username_already_exists') || 'Username already exists',
        );
      }

      const client = await this.clientRepository.create({
        username: registerDto.username,
        email: registerDto.email,
        name: registerDto.name,
        lastname: registerDto.lastname,
        password_hash: hashedPassword,
        type: registerDto.type,
        isActive: true,
      } as any);

      // Auto-login after successful registration
      const loginResponse = await this.authService.login(client);
      return {
        access_token: loginResponse.access_token,
        user: loginResponse.user,
        userType: 'client',
        expiresIn: 86400, // 24 hours in seconds
      };
    }

    throw new BadRequestException('Invalid registration type');
  }
}
