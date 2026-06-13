import {
  IsString,
  IsNotEmpty,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionType } from '../schemas/permission.schema';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'Create User',
    description: 'Display name of the permission (2-100 characters)',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Permission name must be a string' })
  @IsNotEmpty({ message: 'Permission name is required' })
  @MinLength(2, { message: 'Permission name must be at least 2 characters' })
  @MaxLength(100, { message: 'Permission name must not exceed 100 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  name: string;

  @ApiProperty({
    example: PermissionType.USER,
    description: 'Category/type of the permission (required)',
    enum: PermissionType,
    enumName: 'PermissionType',
  })
  @IsEnum(PermissionType, {
    message: `Type must be a valid PermissionType (${Object.values(PermissionType).join(', ')})`,
  })
  @IsNotEmpty({ message: 'Permission type is required' })
  type: PermissionType;
}
