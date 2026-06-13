import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty({ example: 'johndoe', description: 'Unique username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'john@example.com', description: 'User email address' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'hashed_password_here', description: 'Hashed password' })
  @IsString()
  @IsNotEmpty()
  password_hash: string;

  @ApiProperty({ example: 'admin', description: 'User type (e.g. admin, viewer)' })
  @IsString()
  @IsNotEmpty()
  type: string;
}
