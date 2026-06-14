import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse as ApiResDecorator,
  ApiHeader,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AuditActionDecorator } from '../../../core/decorators/audit-action.decorator';
import { AuditAction, EntityType } from '../../audit/schemas/audit-log.schema';
import {
  AUTH_SWAGGER,
  AUTH_RESPONSE_DESCRIPTIONS,
  AUTH_MESSAGES,
  AUTH_EXAMPLES,
} from '../constants/auth.constants';

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
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
