import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';
import { ICategory, ICategoryUseCase } from '../../interfaces/category.interface';
import { CategoryEntity } from '../../domain/entities/category.entity';

@Injectable()
export class CreateCategoryUseCase {
  constructor(private repository: CategoryRepository) {}

  async execute(data: ICategory): Promise<ICategory> {
    const entity = new CategoryEntity(data);
    return this.repository.create(entity);
  }
}

@Injectable()
export class GetCategoryByIdUseCase {
  constructor(private repository: CategoryRepository) {}

  async execute(id: string): Promise<ICategory | null> {
    return this.repository.findById(id);
  }
}

@Injectable()
export class GetCategoryBySlugUseCase {
  constructor(private repository: CategoryRepository) {}

  async execute(slug: string): Promise<ICategory | null> {
    return this.repository.findBySlug(slug);
  }
}

@Injectable()
export class GetAllCategoriesUseCase {
  constructor(private repository: CategoryRepository) {}

  async execute(page: number, limit: number, filters?: any): Promise<{
    items: ICategory[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    const result = await this.repository.findAll(skip, limit, filters);

    return {
      items: result.items,
      total: result.total,
      page,
      limit,
    };
  }
}

@Injectable()
export class GetActiveCategoriesUseCase {
  constructor(private repository: CategoryRepository) {}

  async execute(): Promise<ICategory[]> {
    return this.repository.findActive();
  }
}

@Injectable()
export class UpdateCategoryUseCase {
  constructor(private repository: CategoryRepository) {}

  async execute(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
    return this.repository.update(id, data);
  }
}

@Injectable()
export class DeleteCategoryUseCase {
  constructor(private repository: CategoryRepository) {}

  async execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}

@Injectable()
export class BulkCreateCategoriesUseCase {
  constructor(private repository: CategoryRepository) {}

  async execute(categories: ICategory[]): Promise<ICategory[]> {
    return this.repository.bulkCreate(categories);
  }
}

@Injectable()
export class CategoryUseCaseFactory implements ICategoryUseCase {
  constructor(
    private createUseCase: CreateCategoryUseCase,
    private getByIdUseCase: GetCategoryByIdUseCase,
    private getBySlugUseCase: GetCategoryBySlugUseCase,
    private getAllUseCase: GetAllCategoriesUseCase,
    private getActiveUseCase: GetActiveCategoriesUseCase,
    private updateUseCase: UpdateCategoryUseCase,
    private deleteUseCase: DeleteCategoryUseCase,
    private bulkCreateUseCase: BulkCreateCategoriesUseCase,
  ) {}

  async createCategory(data: ICategory): Promise<ICategory> {
    return this.createUseCase.execute(data);
  }

  async getCategoryById(id: string): Promise<ICategory | null> {
    return this.getByIdUseCase.execute(id);
  }

  async getCategoryBySlug(slug: string): Promise<ICategory | null> {
    return this.getBySlugUseCase.execute(slug);
  }

  async getAllCategories(page: number, limit: number, filters?: any): Promise<{
    items: ICategory[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.getAllUseCase.execute(page, limit, filters);
  }

  async getActiveCategories(): Promise<ICategory[]> {
    return this.getActiveUseCase.execute();
  }

  async updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
    return this.updateUseCase.execute(id, data);
  }

  async deleteCategory(id: string): Promise<void> {
    return this.deleteUseCase.execute(id);
  }

  async bulkCreateCategories(categories: ICategory[]): Promise<ICategory[]> {
    return this.bulkCreateUseCase.execute(categories);
  }
}
