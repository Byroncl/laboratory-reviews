import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from '../../../src/app/modules/categories/infrastructure/repositories/category.repository';
import { CategoryMapper } from '../../../src/app/modules/categories/infrastructure/mappers/category.mapper';
import { Category } from '../../../src/app/modules/categories/schemas/category.schema';
import { CATEGORY_MESSAGES } from '../../../src/app/modules/categories/constants/category.constants';

describe('CategoryRepository', () => {
  let repository: CategoryRepository;
  let mockCategoryModel: any;

  const validCategory = {
    _id: { toString: () => '507f1f77bcf86cd799439011' },
    name: 'Technology',
    slug: 'technology',
    description: 'Tech-related posts',
    color: '#3B82F6',
    postsCount: 0,
    isActive: true,
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
  };

  beforeEach(async () => {
    mockCategoryModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      updateOne: jest.fn(),
      insertMany: jest.fn(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryRepository,
        CategoryMapper,
        {
          provide: getModelToken(Category.name),
          useValue: mockCategoryModel,
        },
      ],
    }).compile();

    repository = module.get<CategoryRepository>(CategoryRepository);
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createData = {
        name: 'Technology',
        slug: 'technology',
        description: 'Tech posts',
        color: '#3B82F6',
        postsCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCategoryModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockCategoryModel.create.mockResolvedValue(validCategory);

      const result = await repository.create(createData as any);

      expect(result).toBeDefined();
      expect(mockCategoryModel.create).toHaveBeenCalled();
    });

    it('should throw error if name already exists', async () => {
      const createData = {
        name: 'Technology',
        slug: 'technology',
        description: 'Tech posts',
        color: '#3B82F6',
        postsCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCategoryModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(validCategory),
      });

      await expect(repository.create(createData as any)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockCategoryModel.findOne).toHaveBeenCalledWith({ name: createData.name });
    });

    it('should throw error if slug already exists', async () => {
      const createData = {
        name: 'Technology',
        slug: 'technology',
        description: 'Tech posts',
        color: '#3B82F6',
        postsCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCategoryModel.findOne
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(validCategory) });

      await expect(repository.create(createData as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findById', () => {
    it('should find category by id', async () => {
      mockCategoryModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(validCategory) });

      const result = await repository.findById('507f1f77bcf86cd799439011');

      expect(result).toBeDefined();
      expect(mockCategoryModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should return null if category not found', async () => {
      mockCategoryModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      const result = await repository.findById('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should find category by slug', async () => {
      mockCategoryModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(validCategory) });

      const result = await repository.findBySlug('technology');

      expect(result).toBeDefined();
      expect(mockCategoryModel.findOne).toHaveBeenCalledWith({ slug: 'technology' });
    });

    it('should return null if category not found by slug', async () => {
      mockCategoryModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      const result = await repository.findBySlug('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all categories with pagination', async () => {
      const mockCategories = [validCategory];
      mockCategoryModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockCategories),
            }),
          }),
        }),
      });

      mockCategoryModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findAll(0, 20);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should apply search filter correctly', async () => {
      const mockCategories = [validCategory];
      const mockQuery = {
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockCategories),
            }),
          }),
        }),
      };

      mockCategoryModel.find.mockReturnValue(mockQuery);
      mockCategoryModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findAll(0, 20, { search: 'technology' });

      expect(result.items).toHaveLength(1);
      expect(mockCategoryModel.find).toHaveBeenCalled();
    });

    it('should filter by isActive by default', async () => {
      const mockCategories = [validCategory];
      mockCategoryModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockCategories),
            }),
          }),
        }),
      });

      mockCategoryModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      await repository.findAll(0, 20);

      const callArgs = mockCategoryModel.find.mock.calls[0][0];
      expect(callArgs.isActive).toBe(true);
    });
  });

  describe('findActive', () => {
    it('should find only active categories', async () => {
      const mockCategories = [validCategory];
      mockCategoryModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCategories),
        }),
      });

      const result = await repository.findActive();

      expect(result).toHaveLength(1);
      expect(mockCategoryModel.find).toHaveBeenCalledWith({ isActive: true });
    });
  });

  describe('update', () => {
    it('should update an existing category', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedCategory = { ...validCategory, name: 'Updated Name' };

      mockCategoryModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(validCategory),
      });
      mockCategoryModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockCategoryModel.findByIdAndUpdate.mockResolvedValue(updatedCategory);

      const result = await repository.update('507f1f77bcf86cd799439011', updateData);

      expect(result).toBeDefined();
      expect(mockCategoryModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should throw error if category not found', async () => {
      mockCategoryModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        repository.update('invalid-id', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should prevent duplicate name on update', async () => {
      const updateData = { name: 'Existing Name' };

      mockCategoryModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(validCategory),
      });
      mockCategoryModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ name: 'Existing Name' }),
      });

      await expect(
        repository.update('507f1f77bcf86cd799439011', updateData),
      ).rejects.toThrow(BadRequestException);
    });

    it('should prevent duplicate slug on update', async () => {
      const updateData = { slug: 'existing-slug' };

      mockCategoryModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(validCategory),
      });
      mockCategoryModel.findOne
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue({ slug: 'existing-slug' }) });

      await expect(
        repository.update('507f1f77bcf86cd799439011', updateData),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete a category', async () => {
      mockCategoryModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(validCategory),
      });
      mockCategoryModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(validCategory),
      });

      await repository.delete('507f1f77bcf86cd799439011');

      expect(mockCategoryModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw error if category not found', async () => {
      mockCategoryModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(repository.delete('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should prevent deletion if category has posts', async () => {
      const categoryWithPosts = { ...validCategory, postsCount: 5 };
      mockCategoryModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(categoryWithPosts),
      });

      await expect(
        repository.delete('507f1f77bcf86cd799439011'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple categories', async () => {
      const categoriesToCreate = [
        {
          name: 'Tech',
          slug: 'tech',
          description: 'Tech posts',
          color: '#3B82F6',
          postsCount: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Design',
          slug: 'design',
          description: 'Design posts',
          color: '#EC4899',
          postsCount: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockCreated = [
        { ...validCategory, name: 'Tech', slug: 'tech' },
        { ...validCategory, name: 'Design', slug: 'design' },
      ];

      mockCategoryModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });
      mockCategoryModel.insertMany.mockResolvedValue(mockCreated);

      const result = await repository.bulkCreate(categoriesToCreate as any);

      expect(result).toHaveLength(2);
      expect(mockCategoryModel.insertMany).toHaveBeenCalled();
    });

    it('should prevent bulk create with duplicate slugs', async () => {
      const categoriesToCreate = [
        {
          name: 'Tech',
          slug: 'tech',
          description: 'Tech posts',
          color: '#3B82F6',
          postsCount: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCategoryModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([validCategory]),
      });

      await expect(
        repository.bulkCreate(categoriesToCreate as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('incrementPostsCount', () => {
    it('should increment posts count', async () => {
      mockCategoryModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await repository.incrementPostsCount('507f1f77bcf86cd799439011');

      expect(mockCategoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { $inc: { postsCount: 1 } },
      );
    });
  });

  describe('decrementPostsCount', () => {
    it('should decrement posts count', async () => {
      mockCategoryModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await repository.decrementPostsCount('507f1f77bcf86cd799439011');

      expect(mockCategoryModel.updateOne).toHaveBeenCalled();
    });

    it('should not allow posts count to go below zero', async () => {
      mockCategoryModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await repository.decrementPostsCount('507f1f77bcf86cd799439011');

      const call = mockCategoryModel.updateOne.mock.calls[0];
      expect(call[1].$inc.postsCount).toBe(-1);
    });
  });
});
