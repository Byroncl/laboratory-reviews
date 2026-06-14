import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from '../services/categories.service';
import { TranslationService } from '../../../core/utils/translation.service';
import { AUTH_KEY } from '../../../core/decorators/auth.decorator';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let mockCategoriesService: jest.Mocked<CategoriesService>;

  const mockCategory = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Technology',
    slug: 'technology',
  } as any;

  beforeEach(async () => {
    mockCategoriesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findBySlug: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        { provide: CategoriesService, useValue: mockCategoriesService },
        {
          provide: TranslationService,
          useValue: { translate: jest.fn((key: string) => key) },
        },
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
      mockCategoriesService.create.mockResolvedValue(mockCategory);

      const response = await controller.create(dto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockCategory);
      expect(mockCategoriesService.create).toHaveBeenCalledWith(dto);
    });
  });

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return all categories', async () => {
      mockCategoriesService.findAll.mockResolvedValue([mockCategory]);

      const response = await controller.findAll({ skip: 0, limit: 20 } as any);

      expect(response.success).toBe(true);
      expect(response.data).toEqual([mockCategory]);
    });
  });

  // ─── findOne ──────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return category by id', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      mockCategoriesService.findOne.mockResolvedValue(mockCategory);

      const response = await controller.findOne(findOneDto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockCategory);
      expect(mockCategoriesService.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });
});
