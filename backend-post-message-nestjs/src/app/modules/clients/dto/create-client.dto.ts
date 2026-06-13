import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 'Jane', description: 'First name of the client' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Smith', description: 'Last name of the client' })
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty({ example: 'janesmith', description: 'Unique username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'jane@example.com', description: 'Client email address' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'hashed_password_here', description: 'Hashed password' })
  @IsString()
  @IsNotEmpty()
  password_hash: string;

  @ApiProperty({ example: 'standard', description: 'Client type' })
  @IsString()
  @IsNotEmpty()
  type: string;
}
