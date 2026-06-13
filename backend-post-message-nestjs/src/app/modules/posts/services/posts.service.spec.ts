import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { Post } from '../schemas/post.schema';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';

describe('PostsService', () => {
  let service: PostsService;

  const mockSave = jest.fn();
  const mockExec = jest.fn();

  const MockPostModel = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: mockSave,
  })) as any;

  MockPostModel.find = jest.fn().mockReturnValue({ exec: mockExec });
  MockPostModel.findById = jest.fn().mockReturnValue({ exec: mockExec });
  MockPostModel.findByIdAndUpdate = jest.fn().mockReturnValue({ exec: mockExec });
  MockPostModel.findByIdAndDelete = jest.fn().mockReturnValue({ exec: mockExec });
  MockPostModel.insertMany = jest.fn();

  const mockPost = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Post',
    content: 'Test content',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getModelToken(Post.name), useValue: MockPostModel },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a post', async () => {
      const dto: CreatePostDto = { title: 'Test Post', content: 'Test content' };
      mockSave.mockResolvedValue(mockPost);

      const result = await service.create(dto);

      expect(result).toEqual(mockPost);
      expect(mockSave).toHaveBeenCalledTimes(1);
    });

    it('should propagate save errors', async () => {
      mockSave.mockRejectedValue(new Error('Validation error'));

      await expect(
        service.create({ title: '', content: '' }),
      ).rejects.toThrow('Validation error');
    });
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      mockExec.mockResolvedValue([mockPost]);

      const result = await service.findAll();

      expect(result).toEqual([mockPost]);
      expect(MockPostModel.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no posts', async () => {
      mockExec.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return post by id', async () => {
      mockExec.mockResolvedValue(mockPost);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockPost);
      expect(MockPostModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null when post not found', async () => {
      mockExec.mockResolvedValue(null);

      const result = await service.findOne('507f1f77bcf86cd799439099');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a post and return updated entity', async () => {
      const dto: UpdatePostDto = { title: 'Updated Title' };
      const updated = { ...mockPost, title: 'Updated Title' };
      mockExec.mockResolvedValue(updated);

      const result = await service.update('507f1f77bcf86cd799439011', dto);

      expect(result).toEqual(updated);
      expect(MockPostModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        dto,
        { new: true },
      );
    });

    it('should return null when post not found for update', async () => {
      mockExec.mockResolvedValue(null);

      const result = await service.update('ghost-id', {});

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a post and return deleted entity', async () => {
      mockExec.mockResolvedValue(mockPost);

      const result = await service.remove('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockPost);
      expect(MockPostModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null when post not found for delete', async () => {
      mockExec.mockResolvedValue(null);

      const result = await service.remove('ghost-id');

      expect(result).toBeNull();
    });
  });

  describe('bulkCreate', () => {
    it('should call insertMany with array of dtos', async () => {
      const dtos: CreatePostDto[] = [
        { title: 'Post 1', content: 'Content 1' },
        { title: 'Post 2', content: 'Content 2' },
      ];
      const insertedDocs = dtos.map((d, i) => ({ _id: `id-${i}`, ...d }));
      MockPostModel.insertMany.mockResolvedValue(insertedDocs);

      const result = await service.bulkCreate(dtos);

      expect(result).toEqual(insertedDocs);
      expect(MockPostModel.insertMany).toHaveBeenCalledWith(dtos);
    });

    it('should propagate insertMany errors', async () => {
      MockPostModel.insertMany.mockRejectedValue(new Error('Bulk insert failed'));

      await expect(service.bulkCreate([])).rejects.toThrow('Bulk insert failed');
    });
  });
});
