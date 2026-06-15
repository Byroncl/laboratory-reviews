import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
  IsAlphanumeric,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  CLIENT_VALIDATION,
  CLIENT_VALIDATION_MESSAGES,
  CLIENT_DTO_DESCRIPTIONS,
  CLIENT_PATTERNS,
  CLIENT_EXAMPLES,
} from '../constants/client.constants';

export class CreateClientDto {
  @ApiProperty({
    example: CLIENT_EXAMPLES.CREATE_REQUEST.name,
    description: CLIENT_DTO_DESCRIPTIONS.NAME,
    minLength: CLIENT_VALIDATION.NAME_MIN_LENGTH,
    maxLength: CLIENT_VALIDATION.NAME_MAX_LENGTH,
  })
  @IsString({ message: CLIENT_VALIDATION_MESSAGES.NAME_STRING })
  @IsNotEmpty({ message: CLIENT_VALIDATION_MESSAGES.NAME_REQUIRED })
  @MinLength(CLIENT_VALIDATION.NAME_MIN_LENGTH, { message: CLIENT_VALIDATION_MESSAGES.NAME_MIN_LENGTH })
  @MaxLength(CLIENT_VALIDATION.NAME_MAX_LENGTH, { message: CLIENT_VALIDATION_MESSAGES.NAME_MAX_LENGTH })
  @Matches(CLIENT_PATTERNS.NAME_LASTNAME, {
    message: CLIENT_VALIDATION_MESSAGES.NAME_PATTERN,
  })
  @Transform(({ value }: { value: string }) => value?.trim())
  name: string;

  @ApiProperty({
    example: CLIENT_EXAMPLES.CREATE_REQUEST.lastname,
    description: CLIENT_DTO_DESCRIPTIONS.LASTNAME,
    minLength: CLIENT_VALIDATION.LASTNAME_MIN_LENGTH,
    maxLength: CLIENT_VALIDATION.LASTNAME_MAX_LENGTH,
  })
  @IsString({ message: CLIENT_VALIDATION_MESSAGES.LASTNAME_STRING })
  @IsNotEmpty({ message: CLIENT_VALIDATION_MESSAGES.LASTNAME_REQUIRED })
  @MinLength(CLIENT_VALIDATION.LASTNAME_MIN_LENGTH, { message: CLIENT_VALIDATION_MESSAGES.LASTNAME_MIN_LENGTH })
  @MaxLength(CLIENT_VALIDATION.LASTNAME_MAX_LENGTH, { message: CLIENT_VALIDATION_MESSAGES.LASTNAME_MAX_LENGTH })
  @Matches(CLIENT_PATTERNS.NAME_LASTNAME, {
    message: CLIENT_VALIDATION_MESSAGES.LASTNAME_PATTERN,
  })
  @Transform(({ value }: { value: string }) => value?.trim())
  lastname: string;

  @ApiProperty({
    example: CLIENT_EXAMPLES.CREATE_REQUEST.username,
    description: CLIENT_DTO_DESCRIPTIONS.USERNAME,
    minLength: CLIENT_VALIDATION.USERNAME_MIN_LENGTH,
    maxLength: CLIENT_VALIDATION.USERNAME_MAX_LENGTH,
  })
  @IsString({ message: CLIENT_VALIDATION_MESSAGES.USERNAME_STRING })
  @IsNotEmpty({ message: CLIENT_VALIDATION_MESSAGES.USERNAME_REQUIRED })
  @MinLength(CLIENT_VALIDATION.USERNAME_MIN_LENGTH, { message: CLIENT_VALIDATION_MESSAGES.USERNAME_MIN_LENGTH })
  @MaxLength(CLIENT_VALIDATION.USERNAME_MAX_LENGTH, { message: CLIENT_VALIDATION_MESSAGES.USERNAME_MAX_LENGTH })
  @IsAlphanumeric(undefined, {
    message: CLIENT_VALIDATION_MESSAGES.USERNAME_ALPHANUMERIC,
  })
  @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
  username: string;

  @ApiProperty({
    example: CLIENT_EXAMPLES.CREATE_REQUEST.email,
    description: CLIENT_DTO_DESCRIPTIONS.EMAIL,
  })
  @IsEmail({}, { message: CLIENT_VALIDATION_MESSAGES.EMAIL_INVALID })
  @IsNotEmpty({ message: CLIENT_VALIDATION_MESSAGES.EMAIL_REQUIRED })
  @MaxLength(CLIENT_VALIDATION.EMAIL_MAX_LENGTH, { message: CLIENT_VALIDATION_MESSAGES.EMAIL_MAX_LENGTH })
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    example: CLIENT_EXAMPLES.CREATE_REQUEST.password_hash,
    description: CLIENT_DTO_DESCRIPTIONS.PASSWORD,
    minLength: CLIENT_VALIDATION.PASSWORD_MIN_LENGTH,
    maxLength: CLIENT_VALIDATION.PASSWORD_MAX_LENGTH,
  })
  @IsString({ message: CLIENT_VALIDATION_MESSAGES.PASSWORD_STRING })
  @IsNotEmpty({ message: CLIENT_VALIDATION_MESSAGES.PASSWORD_REQUIRED })
  @MinLength(CLIENT_VALIDATION.PASSWORD_MIN_LENGTH, { message: CLIENT_VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH })
  @MaxLength(CLIENT_VALIDATION.PASSWORD_MAX_LENGTH, { message: CLIENT_VALIDATION_MESSAGES.PASSWORD_MAX_LENGTH })
  password_hash: string;

  @ApiProperty({
    example: CLIENT_EXAMPLES.CREATE_REQUEST.type,
    description: CLIENT_DTO_DESCRIPTIONS.TYPE,
    minLength: CLIENT_VALIDATION.TYPE_MIN_LENGTH,
    maxLength: CLIENT_VALIDATION.TYPE_MAX_LENGTH,
  })
  @IsString({ message: CLIENT_VALIDATION_MESSAGES.TYPE_STRING })
  @IsNotEmpty({ message: CLIENT_VALIDATION_MESSAGES.TYPE_REQUIRED })
  @MinLength(CLIENT_VALIDATION.TYPE_MIN_LENGTH, { message: CLIENT_VALIDATION_MESSAGES.TYPE_MIN_LENGTH })
  @MaxLength(CLIENT_VALIDATION.TYPE_MAX_LENGTH, { message: CLIENT_VALIDATION_MESSAGES.TYPE_MAX_LENGTH })
  @Transform(({ value }: { value: string }) => value?.trim())
  type: string;
}
