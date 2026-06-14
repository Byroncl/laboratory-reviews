import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsHexColor,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Backend Development',
    description: 'Category name (2-100 characters)',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Category name is required' })
  @IsString({ message: 'Category name must be a string' })
  @MinLength(2, { message: 'Category name must be at least 2 characters' })
  @MaxLength(100, { message: 'Category name must not exceed 100 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  name: string;

  @ApiPropertyOptional({
    example: 'backend-development',
    description: 'Category slug (lowercase, hyphens only, 3-50 characters)',
    minLength: 3,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Category slug must be a string' })
  @MinLength(3, { message: 'Category slug must be at least 3 characters' })
  @MaxLength(50, { message: 'Category slug must not exceed 50 characters' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Category slug must be lowercase with hyphens (no spaces or special characters)',
  })
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  slug?: string;

  @ApiPropertyOptional({
    example: 'Posts about backend development',
    description: 'Category description (1-500 characters)',
    minLength: 1,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Category description must be a string' })
  @MinLength(1, { message: 'Category description cannot be empty' })
  @MaxLength(500, { message: 'Category description must not exceed 500 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({
    example: '#FF5733',
    description: 'Hex color code for category',
  })
  @IsOptional()
  @IsHexColor({ message: 'Color must be a valid hex color (e.g., #FF5733)' })
  color?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    example: 'Backend Development',
    description: 'Category name (2-100 characters)',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Category name must be a string' })
  @MinLength(2, { message: 'Category name must be at least 2 characters' })
  @MaxLength(100, { message: 'Category name must not exceed 100 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({
    example: 'Posts about backend development',
    description: 'Category description (1-500 characters)',
    minLength: 1,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Category description must be a string' })
  @MinLength(1, { message: 'Category description cannot be empty' })
  @MaxLength(500, { message: 'Category description must not exceed 500 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({
    example: '#FF5733',
    description: 'Hex color code for category',
  })
  @IsOptional()
  @IsHexColor({ message: 'Color must be a valid hex color (e.g., #FF5733)' })
  color?: string;
}
