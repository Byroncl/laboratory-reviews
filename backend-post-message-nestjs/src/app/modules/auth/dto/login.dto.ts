import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import {
  AUTH_VALIDATION,
  AUTH_MESSAGES,
  AUTH_EXAMPLES,
  AUTH_DTO_DESCRIPTIONS,
} from '../constants/auth.constants';
import {
  IsValidUsername,
  IsValidPassword,
} from '../validators/auth-validators';

export class LoginDto {
  @ApiProperty({
    example: AUTH_EXAMPLES.LOGIN_REQUEST.username,
    description: AUTH_DTO_DESCRIPTIONS.USERNAME,
    minLength: AUTH_VALIDATION.USERNAME_MIN_LENGTH,
    maxLength: AUTH_VALIDATION.USERNAME_MAX_LENGTH,
  })
  @IsNotEmpty({ message: AUTH_MESSAGES.USERNAME_REQUIRED })
  @IsValidUsername()
  @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
  username: string;

  @ApiProperty({
    example: AUTH_EXAMPLES.LOGIN_REQUEST.password,
    description: AUTH_DTO_DESCRIPTIONS.PASSWORD,
    minLength: AUTH_VALIDATION.PASSWORD_MIN_LENGTH,
    maxLength: AUTH_VALIDATION.PASSWORD_MAX_LENGTH,
  })
  @IsNotEmpty({ message: AUTH_MESSAGES.PASSWORD_REQUIRED })
  @IsValidPassword()
  password: string;
}
