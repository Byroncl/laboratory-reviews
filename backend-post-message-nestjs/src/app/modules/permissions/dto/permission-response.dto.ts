import { ApiProperty } from '@nestjs/swagger';
import { PermissionType } from '../schemas/permission.schema';

export class PermissionResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Permission ID' })
  id: string;

  @ApiProperty({ example: 'Create User', description: 'Permission display name' })
  name: string;

  @ApiProperty({ example: 'create_user', description: 'Permission unique identifier (slug)' })
  identifier: string;

  @ApiProperty({ example: PermissionType.USER, enum: PermissionType, description: 'Permission category' })
  type: PermissionType;

  @ApiProperty({ example: true, description: 'Whether the permission is active' })
  isActive: boolean;
}
