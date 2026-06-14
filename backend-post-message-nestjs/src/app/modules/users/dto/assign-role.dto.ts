import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Role MongoDB ObjectId to assign to the user',
  })
  @IsString()
  @IsNotEmpty()
  roleId: string;
}
