import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { AuditActionDecorator } from '../../../core/decorators/audit-action.decorator';
import { AuditAction, EntityType } from '../../audit/schemas/audit-log.schema';
import {
  AUTH_SWAGGER,
  AUTH_MESSAGES,
  AUTH_EXAMPLES,
} from '../constants/auth.constants';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @AuditActionDecorator(AuditAction.LOGIN, EntityType.USER)
  @ApiOperation({
    summary: AUTH_SWAGGER.LOGIN.summary,
    description: AUTH_SWAGGER.LOGIN.description,
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: AUTH_MESSAGES.LOGIN_SUCCESS,
    type: AuthResponseDto,
    example: { data: AUTH_EXAMPLES.LOGIN_RESPONSE },
  })
  @ApiResponse({
    status: 401,
    description: AUTH_MESSAGES.LOGIN_INVALID_CREDENTIALS,
    example: AUTH_EXAMPLES.ERROR_INVALID_CREDENTIALS,
  })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
