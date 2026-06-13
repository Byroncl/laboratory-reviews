import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { PermissionType } from '../schemas/permission.schema';

export class UpdatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsEnum(PermissionType)
  @IsNotEmpty()
  @IsOptional()
  type?: PermissionType;
}
