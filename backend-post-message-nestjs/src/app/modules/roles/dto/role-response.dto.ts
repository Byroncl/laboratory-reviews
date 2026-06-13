import { ApiProperty } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Role ID' })
  id: string;

  @ApiProperty({ example: 'Administrator', description: 'Role display name' })
  name: string;

  @ApiProperty({ example: 'administrator', description: 'Role unique identifier (slug)' })
  identifier: string;

  @ApiProperty({
    example: ['507f1f77bcf86cd799439012'],
    description: 'Array of permission IDs',
    type: [String],
  })
  permissions: string[];

  @ApiProperty({ example: true, description: 'Whether the role is active' })
  isActive: boolean;
}
