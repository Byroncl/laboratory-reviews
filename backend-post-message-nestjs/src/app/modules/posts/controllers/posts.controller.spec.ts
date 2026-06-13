import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { PostsController } from './posts.controller';
import { PostsService } from '../services/posts.service';
import { PostsGateway } from '../gateways/posts.gateway';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';
import { TranslationService } from '../../../core/utils/translation.service';
import { AUTH_KEY } from '../../../core/decorators/auth.decorator';

describe('PostsController', () => {
  let controller: PostsController;
  let mockPostsService: jest.Mocked<PostsService>;
  let reflector: Reflector;

  const mockPost = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Post',
    content: 'Test content',
  } as any;

  const mockPostWithImage = {
    ...mockPost,
    imageUrl: 'http://localhost:9000/posts/photo.jpg',
    imageFilename: 'photo.jpg',
  } as any;

  const mockGateway = {
    notifyPostCreated: jest.fn(),
    notifyPostUpdated: jest.fn(),
    notifyPostDeleted: jest.fn(),
  };

  beforeEach(async () => {
    mockPostsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      bulkCreate: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        { provide: PostsService, useValue: mockPostsService },
        { provide: PostsGateway, useValue: mockGateway },
        {
          provide: TranslationService,
          useValue: { translate: jest.fn((key: string) => key) },
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─── Auth metadata assertions (TEST-BE-006, TEST-BE-007) ──────────────────

  describe('auth metadata', () => {
    it('create handler carries AUTH_KEY metadata (TEST-BE-006)', () => {
      const metadata = Reflect.getMetadata(AUTH_KEY, controller.create);
      expect(metadata).toBeDefined();
    });

    it('bulkCreate handler carries AUTH_KEY metadata (TEST-BE-007)', () => {
      const metadata = Reflect.getMetadata(AUTH_KEY, controller.bulkCreate);
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
  });

  // ─── Public read contracts (TEST-BE-001, TEST-BE-002) ─────────────────────

  describe('findAll — public read (TEST-BE-001)', () => {
    it('should return paginated posts without auth context', async () => {
      const paginatedResult = { items: [mockPost], total: 1, skip: 0, limit: 10 };
      mockPostsService.findAllPaginated.mockResolvedValue(paginatedResult as any);

      const response = await controller.findAll(
        { skip: 0, limit: 10 } as any,
        undefined,
        undefined,
        undefined,
      );

      expect(response.success).toBe(true);
      expect(mockPostsService.findAllPaginated).toHaveBeenCalled();
    });

    it('should return empty result when no posts exist', async () => {
      mockPostsService.findAllPaginated.mockResolvedValue({ items: [], total: 0, skip: 0, limit: 10 } as any);

      const response = await controller.findAll({ skip: 0, limit: 10 } as any);

      expect(response.success).toBe(true);
    });
  });

  describe('findOne — public read (TEST-BE-002)', () => {
    it('should return post by id without auth context', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      mockPostsService.findOne.mockResolvedValue(mockPost);

      const response = await controller.findOne(findOneDto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockPost);
      expect(mockPostsService.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should return null data when post not found', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439099' };
      mockPostsService.findOne.mockResolvedValue(null);

      const response = await controller.findOne(findOneDto);

      expect(response.data).toBeNull();
    });
  });

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a post and return wrapped response', async () => {
      const dto: CreatePostDto = { title: 'Test Post', content: 'Test content' };
      mockPostsService.create.mockResolvedValue(mockPost);

      const response = await controller.create(dto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockPost);
      expect(mockPostsService.create).toHaveBeenCalledWith(dto);
    });

    it('should create a post with imageUrl', async () => {
      const dto: CreatePostDto = {
        title: 'Test Post',
        content: 'Test content',
        imageUrl: 'http://localhost:9000/posts/photo.jpg',
        imageFilename: 'photo.jpg',
      };
      mockPostsService.create.mockResolvedValue(mockPostWithImage);

      const response = await controller.create(dto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockPostWithImage);
      expect(mockPostsService.create).toHaveBeenCalledWith(dto);
    });

    it('should create a post without image', async () => {
      const dto: CreatePostDto = { title: 'No Image Post', content: 'Content' };
      mockPostsService.create.mockResolvedValue(mockPost);

      const response = await controller.create(dto);

      expect(response.success).toBe(true);
      expect(response.data).not.toHaveProperty('imageUrl');
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update a post and return wrapped response', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      const dto: UpdatePostDto = { title: 'Updated' };
      const updated = { ...mockPost, title: 'Updated' };
      const currentUser = { userId: 'u1', username: 'testuser' } as any;
      mockPostsService.update.mockResolvedValue(updated);

      const response = await controller.update(findOneDto, dto, currentUser);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(updated);
      expect(mockPostsService.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        dto,
      );
    });

    it('should replace image when updating with new imageUrl', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      const dto: UpdatePostDto = {
        imageUrl: 'http://localhost:9000/posts/new.jpg',
        imageFilename: 'new.jpg',
      };
      const updated = { ...mockPost, ...dto };
      const currentUser = { userId: 'u1', username: 'testuser' } as any;
      mockPostsService.update.mockResolvedValue(updated);

      const response = await controller.update(findOneDto, dto, currentUser);

      expect(response.success).toBe(true);
      expect(response.data.imageUrl).toBe('http://localhost:9000/posts/new.jpg');
    });
  });

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should delete a post and return success response', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      const currentUser = { userId: 'u1', username: 'testuser' } as any;
      mockPostsService.remove.mockResolvedValue(mockPost);

      const response = await controller.remove(findOneDto, currentUser);

      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
      expect(mockPostsService.remove).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });
  });

  // ─── bulkCreate ───────────────────────────────────────────────────────────

  describe('bulkCreate', () => {
    it('should create multiple posts', async () => {
      const dtos: CreatePostDto[] = [
        { title: 'Post 1', content: 'Content 1' },
        { title: 'Post 2', content: 'Content 2' },
      ];
      const result = dtos.map((d, i) => ({ _id: `id-${i}`, ...d }));
      mockPostsService.bulkCreate.mockResolvedValue(result);

      const response = await controller.bulkCreate(dtos);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(result);
      expect(mockPostsService.bulkCreate).toHaveBeenCalledWith(dtos);
    });
  });
});
