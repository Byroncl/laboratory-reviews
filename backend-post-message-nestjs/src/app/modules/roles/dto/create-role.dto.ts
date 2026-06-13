import {
  IsString,
  IsNotEmpty,
  IsArray,
  MaxLength,
  MinLength,
  IsMongoId,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    example: 'Administrator',
    description: 'Display name of the role (2-100 characters)',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Role name must be a string' })
  @IsNotEmpty({ message: 'Role name is required' })
  @MinLength(2, { message: 'Role name must be at least 2 characters' })
  @MaxLength(100, { message: 'Role name must not exceed 100 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  name: string;

  @ApiProperty({
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    description: 'Array of valid MongoDB permission IDs (1-100 permissions)',
    type: [String],
    minItems: 1,
    maxItems: 100,
  })
  @IsArray({ message: 'Permissions must be an array' })
  @ArrayMinSize(1, { message: 'At least one permission must be assigned' })
  @ArrayMaxSize(100, { message: 'Maximum 100 permissions can be assigned' })
  @IsMongoId({ each: true, message: 'Each permission ID must be a valid MongoDB ObjectId' })
  permissions: string[];
}
