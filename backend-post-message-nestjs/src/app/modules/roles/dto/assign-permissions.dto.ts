import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionsDto {
  @ApiProperty({
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    description: 'Array of permission ObjectIds to assign to the role',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  permissionIds: string[];
}
