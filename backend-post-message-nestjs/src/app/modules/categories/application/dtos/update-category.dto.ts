import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, Matches, IsOptional, IsHexColor, IsBoolean } from 'class-validator';
import { CATEGORY_VALIDATION, CATEGORY_MESSAGES } from '../../constants/category.constants';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    example: 'Tecnología e Innovación',
    description: 'Nuevo nombre de la categoría',
    minLength: CATEGORY_VALIDATION.NAME_MIN_LENGTH,
    maxLength: CATEGORY_VALIDATION.NAME_MAX_LENGTH,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(CATEGORY_VALIDATION.NAME_MIN_LENGTH, {
    message: CATEGORY_MESSAGES.NAME_TOO_SHORT,
  })
  @MaxLength(CATEGORY_VALIDATION.NAME_MAX_LENGTH, {
    message: CATEGORY_MESSAGES.NAME_TOO_LONG,
  })
  name?: string;

  @ApiPropertyOptional({
    example: 'tecnologia-innovacion',
    description: 'Nuevo slug de la categoría',
    minLength: CATEGORY_VALIDATION.SLUG_MIN_LENGTH,
    maxLength: CATEGORY_VALIDATION.SLUG_MAX_LENGTH,
  })
  @IsOptional()
  @IsString({ message: 'El slug debe ser un texto' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'El slug solo puede contener letras minúsculas, números y guiones',
  })
  slug?: string;

  @ApiPropertyOptional({
    example: 'Posts sobre tecnología, innovación y tendencias',
    description: 'Nueva descripción de la categoría',
    maxLength: CATEGORY_VALIDATION.DESCRIPTION_MAX_LENGTH,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(CATEGORY_VALIDATION.DESCRIPTION_MAX_LENGTH, {
    message: CATEGORY_MESSAGES.DESCRIPTION_TOO_LONG,
  })
  description?: string;

  @ApiPropertyOptional({
    example: '#3B82F6',
    description: 'Nuevo color de la categoría en formato hexadecimal',
  })
  @IsOptional()
  @IsString({ message: 'El color debe ser un texto' })
  @IsHexColor({ message: CATEGORY_MESSAGES.INVALID_COLOR })
  color?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Si la categoría está activa o no',
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  isActive?: boolean;
}
