import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsAlphanumeric,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'Username (alphanumeric, 3-20 characters)',
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
    example: 'mypassword123',
    description: 'Password (6-200 characters)',
    minLength: 6,
    maxLength: 200,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(200, { message: 'Password must not exceed 200 characters' })
  password: string;
}
