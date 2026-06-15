import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID único de la categoría',
    format: 'MongoDB ObjectId',
  })
  id: string;

  @ApiProperty({
    example: 'Tecnología',
    description: 'Nombre de la categoría',
    minLength: 2,
    maxLength: 100,
  })
  name: string;

  @ApiProperty({
    example: 'tecnologia',
    description: 'Slug único de la categoría para URLs',
    minLength: 2,
    maxLength: 100,
  })
  slug: string;

  @ApiProperty({
    example: 'Posts sobre tecnología e innovación',
    description: 'Descripción de la categoría',
    nullable: true,
  })
  description?: string;

  @ApiProperty({
    example: '#3B82F6',
    description: 'Color de la categoría en formato hexadecimal',
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
  })
  color: string;

  @ApiProperty({
    example: 15,
    description: 'Número de posts en esta categoría',
    minimum: 0,
  })
  postsCount: number;

  @ApiProperty({
    example: true,
    description: 'Si la categoría está activa',
  })
  isActive: boolean;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Fecha de creación de la categoría',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Fecha de última actualización',
    format: 'date-time',
  })
  updatedAt: Date;
}

export class CategoriesListResponseDto {
  @ApiProperty({
    description: 'Lista de categorías',
    type: [CategoryResponseDto],
  })
  items: CategoryResponseDto[];

  @ApiProperty({
    example: 5,
    description: 'Total de categorías en la base de datos',
  })
  total: number;

  @ApiProperty({
    example: 1,
    description: 'Página actual',
  })
  page: number;

  @ApiProperty({
    example: 20,
    description: 'Límite de items por página',
  })
  limit: number;
}
