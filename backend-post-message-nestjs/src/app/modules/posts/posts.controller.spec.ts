import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';

describe('PostsController', () => {
  let controller: PostsController;
  let mockPostsService: jest.Mocked<PostsService>;

  const mockPost = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Post',
    content: 'Test content',
  } as any;

  beforeEach(async () => {
    mockPostsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      bulkCreate: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [{ provide: PostsService, useValue: mockPostsService }],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a post and return wrapped response', async () => {
      const dto: CreatePostDto = { title: 'Test Post', content: 'Test content' };
      mockPostsService.create.mockResolvedValue(mockPost);

      const response = await controller.create(dto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockPost);
      expect(mockPostsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      mockPostsService.findAll.mockResolvedValue([mockPost]);

      const response = await controller.findAll();

      expect(response.success).toBe(true);
      expect(response.data).toEqual([mockPost]);
    });

    it('should return empty array when no posts', async () => {
      mockPostsService.findAll.mockResolvedValue([]);

      const response = await controller.findAll();

      expect(response.data).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return post by id', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      mockPostsService.findOne.mockResolvedValue(mockPost);

      const response = await controller.findOne(findOneDto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockPost);
      expect(mockPostsService.findOne).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null data when post not found', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439099' };
      mockPostsService.findOne.mockResolvedValue(null);

      const response = await controller.findOne(findOneDto);

      expect(response.data).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a post and return wrapped response', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      const dto: UpdatePostDto = { title: 'Updated' };
      const updated = { ...mockPost, title: 'Updated' };
      mockPostsService.update.mockResolvedValue(updated);

      const response = await controller.update(findOneDto, dto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(updated);
      expect(mockPostsService.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        dto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a post and return success response', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      mockPostsService.remove.mockResolvedValue(mockPost);

      const response = await controller.remove(findOneDto);

      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
      expect(mockPostsService.remove).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });
  });

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
