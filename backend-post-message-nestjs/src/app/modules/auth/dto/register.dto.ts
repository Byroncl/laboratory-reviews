import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsIn } from 'class-validator';
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

export class RegisterDto {
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

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be valid' })
  @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'First name',
  })
  @IsNotEmpty({ message: 'Name is required' })
  @Transform(({ value }: { value: string }) => value?.trim())
  name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name',
  })
  @IsNotEmpty({ message: 'Last name is required' })
  @Transform(({ value }: { value: string }) => value?.trim())
  lastname: string;

  @ApiProperty({
    example: 'user',
    description: 'Registration type: user or client',
    enum: ['user', 'client'],
  })
  @IsNotEmpty({ message: 'Type is required' })
  @IsIn(['user', 'client'], { message: 'Type must be user or client' })
  type: 'user' | 'client';
}
