import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionType } from '../schemas/permission.schema';

export class UpdatePermissionDto {
  @ApiProperty({
    example: 'Edit User',
    description: 'Display name of the permission (2-100 characters, optional)',
    required: false,
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Permission name must be a string' })
  @MinLength(2, { message: 'Permission name must be at least 2 characters' })
  @MaxLength(100, { message: 'Permission name must not exceed 100 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  name?: string;

  @ApiProperty({
    example: PermissionType.USER,
    description: 'Category/type of the permission (optional)',
    enum: PermissionType,
    enumName: 'PermissionType',
    required: false,
  })
  @IsOptional()
  @IsEnum(PermissionType, {
    message: `Type must be a valid PermissionType (${Object.values(PermissionType).join(', ')})`,
  })
  type?: PermissionType;
}
