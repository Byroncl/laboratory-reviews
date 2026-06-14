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

export class CreateClientDto {
  @ApiProperty({
    example: 'Jane',
    description: 'First name of the client (2-50 characters)',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message: 'First name can only contain letters, spaces, hyphens, and apostrophes',
  })
  @Transform(({ value }: { value: string }) => value?.trim())
  name: string;

  @ApiProperty({
    example: 'Smith',
    description: 'Last name of the client (2-50 characters)',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message: 'Last name can only contain letters, spaces, hyphens, and apostrophes',
  })
  @Transform(({ value }: { value: string }) => value?.trim())
  lastname: string;

  @ApiProperty({
    example: 'janesmith',
    description: 'Unique username (3-20 alphanumeric characters)',
    minLength: 3,
    maxLength: 20,
  })
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(20, { message: 'Username must not exceed 20 characters' })
  @IsAlphanumeric(undefined, {
    message: 'Username must contain only letters and numbers',
  })
  @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
  username: string;

  @ApiProperty({
    example: 'jane@example.com',
    description: 'Valid email address',
  })
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    example: 'hashed_password_here',
    description: 'Hashed password (6-200 characters)',
    minLength: 6,
    maxLength: 200,
  })
  @IsString({ message: 'Password hash must be a string' })
  @IsNotEmpty({ message: 'Password hash is required' })
  @MinLength(6, { message: 'Password hash must be at least 6 characters' })
  @MaxLength(200, { message: 'Password hash must not exceed 200 characters' })
  password_hash: string;

  @ApiProperty({
    example: 'standard',
    description: 'Client type (2-50 characters)',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Client type must be a string' })
  @IsNotEmpty({ message: 'Client type is required' })
  @MinLength(2, { message: 'Client type must be at least 2 characters' })
  @MaxLength(50, { message: 'Client type must not exceed 50 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  type: string;
}
