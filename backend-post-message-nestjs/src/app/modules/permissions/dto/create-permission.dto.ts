import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionType } from '../schemas/permission.schema';

export class CreatePermissionDto {
  @ApiProperty({ example: 'Create User', description: 'Display name of the permission' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: PermissionType.USER,
    description: 'Category/type of the permission',
    enum: PermissionType,
  })
  @IsEnum(PermissionType)
  @IsNotEmpty()
  type: PermissionType;
}
