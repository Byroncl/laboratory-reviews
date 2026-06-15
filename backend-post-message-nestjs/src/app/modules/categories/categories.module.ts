import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema';
import { CategoriesController } from './controllers/categories.controller';
import { CategoriesService } from './services/categories.service';
import { CategoryRepository } from './infrastructure/repositories/category.repository';
import { CategoryMapper } from './infrastructure/mappers/category.mapper';
import {
  CreateCategoryUseCase,
  GetCategoryByIdUseCase,
  GetCategoryBySlugUseCase,
  GetAllCategoriesUseCase,
  GetActiveCategoriesUseCase,
  UpdateCategoryUseCase,
  DeleteCategoryUseCase,
  BulkCreateCategoriesUseCase,
  CategoryUseCaseFactory,
} from './application/use-cases/category.use-cases';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    CategoryMapper,
    CategoryRepository,
    CreateCategoryUseCase,
    GetCategoryByIdUseCase,
    GetCategoryBySlugUseCase,
    GetAllCategoriesUseCase,
    GetActiveCategoriesUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    BulkCreateCategoriesUseCase,
    CategoryUseCaseFactory,
  ],
  exports: [CategoriesService, CategoryRepository, CategoryUseCaseFactory],
})
export class CategoriesModule {}
