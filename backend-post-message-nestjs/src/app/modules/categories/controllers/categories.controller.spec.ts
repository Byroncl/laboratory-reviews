import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoryUseCaseFactory } from '../application/use-cases/category.use-cases';
import { AUTH_KEY } from '../../../core/decorators/auth.decorator';
import { CreateCategoryDto } from '../application/dtos/create-category.dto';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let mockUseCaseFactory: jest.Mocked<CategoryUseCaseFactory>;

  const mockCategory = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Technology',
    slug: 'technology',
  } as any;

  beforeEach(async () => {
    mockUseCaseFactory = {
      getAllCategories: jest.fn(),
      getCategoryById: jest.fn(),
      getCategoryBySlug: jest.fn(),
      getActiveCategories: jest.fn(),
      createCategory: jest.fn(),
      bulkCreateCategories: jest.fn(),
      updateCategory: jest.fn(),
      deleteCategory: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        { provide: CategoryUseCaseFactory, useValue: mockUseCaseFactory },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─── Auth metadata assertions (TEST-BE-009) ───────────────────────────────

  describe('auth metadata', () => {
    it('create handler carries AUTH_KEY metadata (TEST-BE-009)', () => {
      const metadata = Reflect.getMetadata(AUTH_KEY, controller.create);
      expect(metadata).toBeDefined();
    });

    it('findAll handler does NOT carry AUTH_KEY metadata (public read)', () => {
      const metadata = Reflect.getMetadata(AUTH_KEY, controller.findAll);
      expect(metadata).toBeUndefined();
    });

    it('findOne handler does NOT carry AUTH_KEY metadata (public read)', () => {
      const metadata = Reflect.getMetadata(AUTH_KEY, controller.findOne);
      expect(metadata).toBeUndefined();
    });

    it('update handler carries AUTH_KEY metadata', () => {
      const metadata = Reflect.getMetadata(AUTH_KEY, controller.update);
      expect(metadata).toBeDefined();
    });

    it('delete handler carries AUTH_KEY metadata', () => {
      const metadata = Reflect.getMetadata(AUTH_KEY, controller.delete);
      expect(metadata).toBeDefined();
    });
  });

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a category and return wrapped response', async () => {
      const dto = { name: 'Technology', slug: 'technology' } as any;
      mockUseCaseFactory.createCategory.mockResolvedValue(mockCategory);

      const response = await controller.create(dto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockCategory);
      expect(mockUseCaseFactory.createCategory).toHaveBeenCalledWith(dto);
    });
  });

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return all categories', async () => {
      mockUseCaseFactory.getAllCategories.mockResolvedValue([mockCategory] as any);

      const response = await controller.findAll({ skip: 0, limit: 20 } as any);

      expect(response.success).toBe(true);
      expect(response.data).toEqual([mockCategory]);
    });
  });

  // ─── findOne ──────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return category by id', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      mockUseCaseFactory.getCategoryById.mockResolvedValue(mockCategory);

      const response = await controller.findOne(findOneDto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockCategory);
      expect(mockUseCaseFactory.getCategoryById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });
});
