import { Injectable } from '@nestjs/common';
import { CategoryEntity } from '../../domain/entities/category.entity';
import { CategoryResponseDto, CategoriesListResponseDto } from '../../application/dtos/category-response.dto';

@Injectable()
export class CategoryMapper {
  toDomain(raw: any): CategoryEntity {
    return new CategoryEntity({
      _id: raw._id?.toString(),
      name: raw.name,
      slug: raw.slug,
      description: raw.description,
      color: raw.color,
      postsCount: raw.postsCount || 0,
      isActive: raw.isActive !== false,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  toResponse(entity: CategoryEntity): CategoryResponseDto {
    return {
      id: entity._id,
      name: entity.name,
      slug: entity.slug,
      description: entity.description,
      color: entity.color,
      postsCount: entity.postsCount,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  toResponseList(
    entities: CategoryEntity[],
    total: number,
    page: number,
    limit: number,
  ): CategoriesListResponseDto {
    return {
      items: entities.map(e => this.toResponse(e)),
      total,
      page,
      limit,
    };
  }

  toPersistence(entity: CategoryEntity): any {
    return {
      name: entity.name,
      slug: entity.slug,
      description: entity.description,
      color: entity.color,
      postsCount: entity.postsCount,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
