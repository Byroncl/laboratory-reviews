import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { CommentsService } from './comments.service';
import { Comment } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

describe('CommentsService', () => {
  let service: CommentsService;

  const mockSave = jest.fn();
  const mockExec = jest.fn();

  const MockCommentModel = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: mockSave,
  })) as any;

  MockCommentModel.find = jest.fn().mockReturnValue({ exec: mockExec });
  MockCommentModel.findById = jest.fn().mockReturnValue({ exec: mockExec });
  MockCommentModel.findByIdAndUpdate = jest.fn().mockReturnValue({ exec: mockExec });
  MockCommentModel.findByIdAndDelete = jest.fn().mockReturnValue({ exec: mockExec });

  const mockComment = {
    _id: '507f1f77bcf86cd799439011',
    content: 'Great post!',
    postId: '507f1f77bcf86cd799439022',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getModelToken(Comment.name), useValue: MockCommentModel },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a comment', async () => {
      const dto: CreateCommentDto = {
        content: 'Great post!',
        postId: '507f1f77bcf86cd799439022',
      } as any;
      mockSave.mockResolvedValue(mockComment);

      const result = await service.create(dto);

      expect(result).toEqual(mockComment);
      expect(mockSave).toHaveBeenCalledTimes(1);
    });

    it('should propagate save errors', async () => {
      mockSave.mockRejectedValue(new Error('Validation error'));

      await expect(service.create({} as any)).rejects.toThrow('Validation error');
    });
  });

  describe('findAll', () => {
    it('should return all comments when no postId filter', async () => {
      mockExec.mockResolvedValue([mockComment]);

      const result = await service.findAll();

      expect(result).toEqual([mockComment]);
      expect(MockCommentModel.find).toHaveBeenCalledWith({});
    });

    it('should filter by postId when provided', async () => {
      const postId = '507f1f77bcf86cd799439022' as any as MongooseSchema.Types.ObjectId;
      mockExec.mockResolvedValue([mockComment]);

      const result = await service.findAll(postId);

      expect(result).toEqual([mockComment]);
      expect(MockCommentModel.find).toHaveBeenCalledWith({ postId });
    });

    it('should return empty array when no comments match', async () => {
      mockExec.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return comment by id', async () => {
      mockExec.mockResolvedValue(mockComment);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockComment);
      expect(MockCommentModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null when comment not found', async () => {
      mockExec.mockResolvedValue(null);

      const result = await service.findOne('ghost-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const dto: UpdateCommentDto = { content: 'Updated content' } as any;
      const updated = { ...mockComment, content: 'Updated content' };
      mockExec.mockResolvedValue(updated);

      const result = await service.update('507f1f77bcf86cd799439011', dto);

      expect(result).toEqual(updated);
      expect(MockCommentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        dto,
        { new: true },
      );
    });

    it('should return null when comment not found for update', async () => {
      mockExec.mockResolvedValue(null);

      const result = await service.update('ghost-id', {} as any);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a comment', async () => {
      mockExec.mockResolvedValue(mockComment);

      const result = await service.remove('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockComment);
      expect(MockCommentModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null when comment not found for delete', async () => {
      mockExec.mockResolvedValue(null);

      const result = await service.remove('ghost-id');

      expect(result).toBeNull();
    });
  });
});
