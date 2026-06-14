import { Test, TestingModule } from '@nestjs/testing';
import { CategoryRepository } from '../../../src/app/modules/categories/infrastructure/repositories/category.repository';
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
} from '../../../src/app/modules/categories/application/use-cases/category.use-cases';

describe('Category Use Cases', () => {
  let mockRepository: jest.Mocked<CategoryRepository>;

  const validCategory = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Technology',
    slug: 'technology',
    description: 'Tech-related posts',
    color: '#3B82F6',
    postsCount: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findAll: jest.fn(),
      findActive: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      bulkCreate: jest.fn(),
      incrementPostsCount: jest.fn(),
      decrementPostsCount: jest.fn(),
    } as any;
  });

  describe('CreateCategoryUseCase', () => {
    it('should create a category', async () => {
      const useCase = new CreateCategoryUseCase(mockRepository);
      mockRepository.create.mockResolvedValue(validCategory);

      const result = await useCase.execute(validCategory);

      expect(result).toEqual(validCategory);
      expect(mockRepository.create).toHaveBeenCalled();
    });
  });

  describe('GetCategoryByIdUseCase', () => {
    it('should get category by id', async () => {
      const useCase = new GetCategoryByIdUseCase(mockRepository);
      mockRepository.findById.mockResolvedValue(validCategory);

      const result = await useCase.execute('507f1f77bcf86cd799439011');

      expect(result).toEqual(validCategory);
      expect(mockRepository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should return null if category not found', async () => {
      const useCase = new GetCategoryByIdUseCase(mockRepository);
      mockRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('GetCategoryBySlugUseCase', () => {
    it('should get category by slug', async () => {
      const useCase = new GetCategoryBySlugUseCase(mockRepository);
      mockRepository.findBySlug.mockResolvedValue(validCategory);

      const result = await useCase.execute('technology');

      expect(result).toEqual(validCategory);
      expect(mockRepository.findBySlug).toHaveBeenCalledWith('technology');
    });

    it('should return null if category not found by slug', async () => {
      const useCase = new GetCategoryBySlugUseCase(mockRepository);
      mockRepository.findBySlug.mockResolvedValue(null);

      const result = await useCase.execute('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('GetAllCategoriesUseCase', () => {
    it('should get all categories with pagination', async () => {
      const useCase = new GetAllCategoriesUseCase(mockRepository);
      mockRepository.findAll.mockResolvedValue({
        items: [validCategory],
        total: 1,
      });

      const result = await useCase.execute(1, 20);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should calculate correct skip value', async () => {
      const useCase = new GetAllCategoriesUseCase(mockRepository);
      mockRepository.findAll.mockResolvedValue({
        items: [],
        total: 0,
      });

      await useCase.execute(3, 20);

      expect(mockRepository.findAll).toHaveBeenCalledWith(40, 20, undefined);
    });

    it('should pass filters to repository', async () => {
      const useCase = new GetAllCategoriesUseCase(mockRepository);
      mockRepository.findAll.mockResolvedValue({
        items: [validCategory],
        total: 1,
      });

      const filters = { search: 'tech' };
      await useCase.execute(1, 20, filters);

      expect(mockRepository.findAll).toHaveBeenCalledWith(0, 20, filters);
    });
  });

  describe('GetActiveCategoriesUseCase', () => {
    it('should get active categories', async () => {
      const useCase = new GetActiveCategoriesUseCase(mockRepository);
      mockRepository.findActive.mockResolvedValue([validCategory]);

      const result = await useCase.execute();

      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(true);
      expect(mockRepository.findActive).toHaveBeenCalled();
    });

    it('should return empty array if no active categories', async () => {
      const useCase = new GetActiveCategoriesUseCase(mockRepository);
      mockRepository.findActive.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result).toHaveLength(0);
    });
  });

  describe('UpdateCategoryUseCase', () => {
    it('should update a category', async () => {
      const useCase = new UpdateCategoryUseCase(mockRepository);
      const updatedCategory = { ...validCategory, name: 'Updated Tech' };
      mockRepository.update.mockResolvedValue(updatedCategory);

      const result = await useCase.execute('507f1f77bcf86cd799439011', {
        name: 'Updated Tech',
      });

      expect(result.name).toBe('Updated Tech');
      expect(mockRepository.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { name: 'Updated Tech' },
      );
    });

    it('should return null if category not found', async () => {
      const useCase = new UpdateCategoryUseCase(mockRepository);
      mockRepository.update.mockResolvedValue(null);

      const result = await useCase.execute('invalid-id', { name: 'Updated' });

      expect(result).toBeNull();
    });
  });

  describe('DeleteCategoryUseCase', () => {
    it('should delete a category', async () => {
      const useCase = new DeleteCategoryUseCase(mockRepository);
      mockRepository.delete.mockResolvedValue(undefined);

      await useCase.execute('507f1f77bcf86cd799439011');

      expect(mockRepository.delete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });
  });

  describe('BulkCreateCategoriesUseCase', () => {
    it('should create multiple categories', async () => {
      const useCase = new BulkCreateCategoriesUseCase(mockRepository);
      const categories = [validCategory, { ...validCategory, name: 'Design' }];
      mockRepository.bulkCreate.mockResolvedValue(categories);

      const result = await useCase.execute(categories);

      expect(result).toHaveLength(2);
      expect(mockRepository.bulkCreate).toHaveBeenCalledWith(categories);
    });

    it('should return empty array if no categories provided', async () => {
      const useCase = new BulkCreateCategoriesUseCase(mockRepository);
      mockRepository.bulkCreate.mockResolvedValue([]);

      const result = await useCase.execute([]);

      expect(result).toHaveLength(0);
    });
  });

  describe('CategoryUseCaseFactory', () => {
    let factory: CategoryUseCaseFactory;

    beforeEach(() => {
      factory = new CategoryUseCaseFactory(
        new CreateCategoryUseCase(mockRepository),
        new GetCategoryByIdUseCase(mockRepository),
        new GetCategoryBySlugUseCase(mockRepository),
        new GetAllCategoriesUseCase(mockRepository),
        new GetActiveCategoriesUseCase(mockRepository),
        new UpdateCategoryUseCase(mockRepository),
        new DeleteCategoryUseCase(mockRepository),
        new BulkCreateCategoriesUseCase(mockRepository),
      );
    });

    it('should delegate to CreateCategoryUseCase', async () => {
      mockRepository.create.mockResolvedValue(validCategory);

      const result = await factory.createCategory(validCategory);

      expect(result).toEqual(validCategory);
    });

    it('should delegate to GetCategoryByIdUseCase', async () => {
      mockRepository.findById.mockResolvedValue(validCategory);

      const result = await factory.getCategoryById('507f1f77bcf86cd799439011');

      expect(result).toEqual(validCategory);
    });

    it('should delegate to GetCategoryBySlugUseCase', async () => {
      mockRepository.findBySlug.mockResolvedValue(validCategory);

      const result = await factory.getCategoryBySlug('technology');

      expect(result).toEqual(validCategory);
    });

    it('should delegate to GetAllCategoriesUseCase', async () => {
      mockRepository.findAll.mockResolvedValue({
        items: [validCategory],
        total: 1,
      });

      const result = await factory.getAllCategories(1, 20);

      expect(result.items).toHaveLength(1);
    });

    it('should delegate to GetActiveCategoriesUseCase', async () => {
      mockRepository.findActive.mockResolvedValue([validCategory]);

      const result = await factory.getActiveCategories();

      expect(result).toHaveLength(1);
    });

    it('should delegate to UpdateCategoryUseCase', async () => {
      const updatedCategory = { ...validCategory, name: 'Updated' };
      mockRepository.update.mockResolvedValue(updatedCategory);

      const result = await factory.updateCategory('507f1f77bcf86cd799439011', {
        name: 'Updated',
      });

      expect(result.name).toBe('Updated');
    });

    it('should delegate to DeleteCategoryUseCase', async () => {
      mockRepository.delete.mockResolvedValue(undefined);

      await factory.deleteCategory('507f1f77bcf86cd799439011');

      expect(mockRepository.delete).toHaveBeenCalled();
    });

    it('should delegate to BulkCreateCategoriesUseCase', async () => {
      const categories = [validCategory];
      mockRepository.bulkCreate.mockResolvedValue(categories);

      const result = await factory.bulkCreateCategories(categories);

      expect(result).toHaveLength(1);
    });
  });
});
