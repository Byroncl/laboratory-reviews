import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { Post } from '../schemas/post.schema';
import { Comment } from '../../comments/schemas/comment.schema';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { FilesService } from '../../files/services/files.service';

describe('PostsService', () => {
  let service: PostsService;
  let mockFilesService: jest.Mocked<FilesService>;

  const mockSave = jest.fn();
  const mockExec = jest.fn();

  const MockPostModel = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: mockSave,
  })) as any;

  MockPostModel.find = jest.fn().mockReturnValue({ exec: mockExec });
  MockPostModel.findById = jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnValue({ exec: mockExec }),
    exec: mockExec,
  });
  MockPostModel.findByIdAndUpdate = jest.fn().mockReturnValue({ exec: mockExec });
  MockPostModel.findByIdAndDelete = jest.fn().mockReturnValue({ exec: mockExec });
  MockPostModel.insertMany = jest.fn();

  const mockPost = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Post',
    content: 'Test content',
    save: jest.fn().mockResolvedValue(true),
    toObject: function () {
      return { _id: this._id, title: this.title, content: this.content };
    },
  };

  const mockPostWithImage = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Post',
    content: 'Test content',
    imageUrl: 'http://localhost:9000/posts/old.jpg',
    imageFilename: 'old.jpg',
    save: jest.fn().mockResolvedValue(true),
    toObject: function () {
      return {
        _id: this._id,
        title: this.title,
        content: this.content,
        imageUrl: this.imageUrl,
        imageFilename: this.imageFilename,
      };
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockFilesService = {
      uploadImage: jest.fn(),
      deleteImage: jest.fn(),
      getImageUrl: jest.fn(),
    } as any;

    const MockCommentModel = {
      countDocuments: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getModelToken(Post.name), useValue: MockPostModel },
        { provide: getModelToken(Comment.name), useValue: MockCommentModel },
        { provide: FilesService, useValue: mockFilesService },
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

    it('should create a post with imageUrl', async () => {
      const dto: CreatePostDto = {
        title: 'Test Post',
        content: 'Test content',
        imageUrl: 'http://localhost:9000/posts/new.jpg',
        imageFilename: 'new.jpg',
      };
      mockSave.mockResolvedValue({ ...mockPost, ...dto });

      const result = await service.create(dto);

      expect(result).toHaveProperty('imageUrl');
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

      expect(result).toEqual({
        _id: mockPost._id,
        title: mockPost.title,
        content: mockPost.content,
        commentCount: 0,
        viewCount: 1,
      });
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
      // findById returns null (no existing image), findByIdAndUpdate returns updated
      mockExec
        .mockResolvedValueOnce(null) // findById for existing image check
        .mockResolvedValueOnce(updated); // findByIdAndUpdate

      const result = await service.update('507f1f77bcf86cd799439011', dto);

      expect(result).toEqual(updated);
    });

    it('should delete previous image when replacing with a new one', async () => {
      const dto: UpdatePostDto = {
        imageUrl: 'http://localhost:9000/posts/new.jpg',
        imageFilename: 'new.jpg',
      };
      const updated = { ...mockPostWithImage, ...dto };
      mockExec
        .mockResolvedValueOnce(mockPostWithImage) // findById returns existing post with image
        .mockResolvedValueOnce(updated); // findByIdAndUpdate

      await service.update('507f1f77bcf86cd799439011', dto);

      expect(mockFilesService.deleteImage).toHaveBeenCalledWith('old.jpg');
    });

    it('should return null when post not found for update', async () => {
      mockExec
        .mockResolvedValueOnce(null) // findById
        .mockResolvedValueOnce(null); // findByIdAndUpdate

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

    it('should delete associated image when removing a post with image', async () => {
      mockExec.mockResolvedValue(mockPostWithImage);

      await service.remove('507f1f77bcf86cd799439011');

      expect(mockFilesService.deleteImage).toHaveBeenCalledWith('old.jpg');
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
