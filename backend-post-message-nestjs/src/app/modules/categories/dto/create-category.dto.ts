import { IsNotEmpty, IsString, IsOptional, IsHexColor } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Backend Development' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'backend-development' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'Posts about backend development' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '#FF5733' })
  @IsOptional()
  @IsHexColor()
  color?: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;
}
