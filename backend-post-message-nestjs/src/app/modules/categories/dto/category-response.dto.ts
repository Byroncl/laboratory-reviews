import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'Backend Development' })
  name: string;

  @ApiProperty({ example: 'backend-development' })
  slug: string;

  @ApiPropertyOptional({ example: 'Posts about backend development' })
  description?: string;

  @ApiProperty({ example: '#3B82F6' })
  color: string;

  @ApiProperty({ example: 5 })
  postsCount: number;

  @ApiProperty()
  createdAt: Date;
}
