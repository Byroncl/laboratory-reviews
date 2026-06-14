import { ApiProperty } from '@nestjs/swagger';

export class ClientResponseDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Client ID',
  })
  id: string;

  @ApiProperty({ example: 'Jane', description: 'First name' })
  name: string;

  @ApiProperty({ example: 'Smith', description: 'Last name' })
  lastname: string;

  @ApiProperty({ example: 'janesmith', description: 'Username' })
  username: string;

  @ApiProperty({ example: 'jane@example.com', description: 'Email address' })
  email: string;

  @ApiProperty({ example: 'standard', description: 'Client type' })
  type: string;

  @ApiProperty({ example: true, description: 'Whether the client is active' })
  isActive: boolean;
}
