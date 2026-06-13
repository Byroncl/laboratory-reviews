import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { PermissionType } from '../schemas/permission.schema';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(PermissionType)
  @IsNotEmpty()
  type: PermissionType;
}
