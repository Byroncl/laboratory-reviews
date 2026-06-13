import { IsString, IsNotEmpty, IsEnum, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionType } from '../schemas/permission.schema';

export class CreatePermissionDto {
  @ApiProperty({ example: 'Create User', description: 'Display name of the permission' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }: { value: string }) => value?.trim())
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
