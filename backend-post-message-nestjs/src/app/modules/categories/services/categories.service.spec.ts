import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from '../schemas/category.schema';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../dto/create-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockSave = jest.fn();
  const mockExec = jest.fn();

  const MockCategoryModel = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: mockSave,
  })) as any;

  MockCategoryModel.find = jest
    .fn()
    .mockReturnValue({ sort: jest.fn().mockReturnValue({ exec: mockExec }) });
  MockCategoryModel.findOne = jest.fn().mockReturnValue({ exec: mockExec });
  MockCategoryModel.findById = jest.fn().mockReturnValue({ exec: mockExec });
  MockCategoryModel.findByIdAndUpdate = jest
    .fn()
    .mockReturnValue({ exec: mockExec });
  MockCategoryModel.findByIdAndDelete = jest
    .fn()
    .mockReturnValue({ exec: mockExec });

  const mockCategory = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Backend',
    slug: 'backend',
    color: '#3B82F6',
    postsCount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getModelToken(Category.name), useValue: MockCategoryModel },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category with auto-generated slug', async () => {
      const dto: CreateCategoryDto = { name: 'Backend Development' };
      mockExec.mockResolvedValueOnce(null); // findOne — slug not taken
      mockSave.mockResolvedValueOnce({
        ...mockCategory,
        name: 'Backend Development',
        slug: 'backend-development',
      });

      const result = await service.create(dto);

      expect(result).toHaveProperty('slug', 'backend-development');
      expect(mockSave).toHaveBeenCalledTimes(1);
    });

    it('should use provided slug when given', async () => {
      const dto: CreateCategoryDto = { name: 'Backend', slug: 'be' };
      mockExec.mockResolvedValueOnce(null);
      mockSave.mockResolvedValueOnce({ ...mockCategory, slug: 'be' });

      const result = await service.create(dto);

      expect(result).toHaveProperty('slug', 'be');
    });

    it('should throw ConflictException when slug already exists', async () => {
      const dto: CreateCategoryDto = { name: 'Backend', slug: 'backend' };
      mockExec.mockResolvedValueOnce(mockCategory); // slug already taken

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all categories sorted by name', async () => {
      mockExec.mockResolvedValueOnce([mockCategory]);

      const result = await service.findAll();

      expect(result).toEqual([mockCategory]);
      expect(MockCategoryModel.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no categories', async () => {
      mockExec.mockResolvedValueOnce([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return category by id', async () => {
      mockExec.mockResolvedValueOnce(mockCategory);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockCategory);
      expect(MockCategoryModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw NotFoundException when not found', async () => {
      mockExec.mockResolvedValueOnce(null);

      await expect(service.findOne('ghost-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('should return category by slug', async () => {
      mockExec.mockResolvedValueOnce(mockCategory);

      const result = await service.findBySlug('backend');

      expect(result).toEqual(mockCategory);
      expect(MockCategoryModel.findOne).toHaveBeenCalledWith({
        slug: 'backend',
      });
    });

    it('should throw NotFoundException when slug not found', async () => {
      mockExec.mockResolvedValueOnce(null);

      await expect(service.findBySlug('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the updated category', async () => {
      const dto: UpdateCategoryDto = { name: 'Updated Backend' };
      const updated = { ...mockCategory, name: 'Updated Backend' };
      mockExec.mockResolvedValueOnce(updated);

      const result = await service.update('507f1f77bcf86cd799439011', dto);

      expect(result).toEqual(updated);
      expect(MockCategoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        dto,
        { new: true },
      );
    });

    it('should throw NotFoundException when category not found', async () => {
      mockExec.mockResolvedValueOnce(null);

      await expect(service.update('ghost-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a category', async () => {
      mockExec.mockResolvedValueOnce(mockCategory);

      await expect(
        service.remove('507f1f77bcf86cd799439011'),
      ).resolves.toBeUndefined();
      expect(MockCategoryModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw NotFoundException when category not found', async () => {
      mockExec.mockResolvedValueOnce(null);

      await expect(service.remove('ghost-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('incrementPostsCount', () => {
    it('should call findByIdAndUpdate with $inc postsCount', async () => {
      mockExec.mockResolvedValueOnce(mockCategory);

      await service.incrementPostsCount('507f1f77bcf86cd799439011');

      expect(MockCategoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { $inc: { postsCount: 1 } },
      );
    });
  });

  describe('decrementPostsCount', () => {
    it('should call findByIdAndUpdate with $inc postsCount -1', async () => {
      mockExec.mockResolvedValueOnce(mockCategory);

      await service.decrementPostsCount('507f1f77bcf86cd799439011');

      expect(MockCategoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { $inc: { postsCount: -1 } },
      );
    });
  });
});
