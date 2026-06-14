import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, Matches, IsOptional, IsHexColor } from 'class-validator';
import { CATEGORY_VALIDATION, CATEGORY_MESSAGES } from '../../constants/category.constants';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Tecnología',
    description: 'Nombre de la categoría',
    minLength: CATEGORY_VALIDATION.NAME_MIN_LENGTH,
    maxLength: CATEGORY_VALIDATION.NAME_MAX_LENGTH,
  })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: CATEGORY_MESSAGES.NAME_REQUIRED })
  @MinLength(CATEGORY_VALIDATION.NAME_MIN_LENGTH, {
    message: CATEGORY_MESSAGES.NAME_TOO_SHORT,
  })
  @MaxLength(CATEGORY_VALIDATION.NAME_MAX_LENGTH, {
    message: CATEGORY_MESSAGES.NAME_TOO_LONG,
  })
  name: string;

  @ApiProperty({
    example: 'tecnologia',
    description: 'Slug único para la categoría (URL-friendly)',
    minLength: CATEGORY_VALIDATION.SLUG_MIN_LENGTH,
    maxLength: CATEGORY_VALIDATION.SLUG_MAX_LENGTH,
  })
  @IsString({ message: 'El slug debe ser un texto' })
  @IsNotEmpty({ message: CATEGORY_MESSAGES.SLUG_REQUIRED })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'El slug solo puede contener letras minúsculas, números y guiones',
  })
  slug: string;

  @ApiPropertyOptional({
    example: 'Posts sobre tecnología e innovación',
    description: 'Descripción de la categoría',
    maxLength: CATEGORY_VALIDATION.DESCRIPTION_MAX_LENGTH,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(CATEGORY_VALIDATION.DESCRIPTION_MAX_LENGTH, {
    message: CATEGORY_MESSAGES.DESCRIPTION_TOO_LONG,
  })
  description?: string;

  @ApiProperty({
    example: '#3B82F6',
    description: 'Color de la categoría en formato hexadecimal',
    default: '#3B82F6',
  })
  @IsString({ message: 'El color debe ser un texto' })
  @IsHexColor({ message: CATEGORY_MESSAGES.INVALID_COLOR })
  color: string = '#3B82F6';
}
