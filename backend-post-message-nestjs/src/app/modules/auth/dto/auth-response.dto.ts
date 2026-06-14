import { ApiProperty } from '@nestjs/swagger';
import { AUTH_EXAMPLES, AUTH_DTO_DESCRIPTIONS } from '../constants/auth.constants';

export class AuthResponseDto {
  @ApiProperty({
    example: AUTH_EXAMPLES.LOGIN_RESPONSE.access_token,
    description: AUTH_DTO_DESCRIPTIONS.ACCESS_TOKEN,
    format: AUTH_DTO_DESCRIPTIONS.ACCESS_TOKEN_FORMAT,
  })
  access_token: string;
}
