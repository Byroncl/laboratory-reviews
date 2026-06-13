import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionType } from '../schemas/permission.schema';

export class UpdatePermissionDto {
  @ApiProperty({ example: 'Edit User', description: 'Display name of the permission', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: PermissionType.USER,
    description: 'Category/type of the permission',
    enum: PermissionType,
    required: false,
  })
  @IsEnum(PermissionType)
  @IsNotEmpty()
  @IsOptional()
  type?: PermissionType;
}
