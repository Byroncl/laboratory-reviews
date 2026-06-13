import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from '../services/comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { FindCommentsByPostDto } from '../dto/find-comments-by-post.dto';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';

describe('CommentsController', () => {
  let controller: CommentsController;
  let mockCommentsService: jest.Mocked<CommentsService>;

  const mockComment = {
    _id: '507f1f77bcf86cd799439011',
    content: 'Great post!',
    postId: '507f1f77bcf86cd799439022',
  } as any;

  beforeEach(async () => {
    mockCommentsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [{ provide: CommentsService, useValue: mockCommentsService }],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment and return wrapped response', async () => {
      const dto: CreateCommentDto = {
        content: 'Great post!',
        postId: '507f1f77bcf86cd799439022',
      } as any;
      mockCommentsService.create.mockResolvedValue(mockComment);

      const response = await controller.create(dto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockComment);
      expect(mockCommentsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return comments filtered by postId', async () => {
      const queryDto: FindCommentsByPostDto = {
        postId: '507f1f77bcf86cd799439022' as any,
      };
      mockCommentsService.findAll.mockResolvedValue([mockComment]);

      const response = await controller.findAll(queryDto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual([mockComment]);
      expect(mockCommentsService.findAll).toHaveBeenCalledWith(queryDto.postId);
    });

    it('should return empty array when no comments match', async () => {
      const queryDto: FindCommentsByPostDto = {
        postId: '507f1f77bcf86cd799439099' as any,
      };
      mockCommentsService.findAll.mockResolvedValue([]);

      const response = await controller.findAll(queryDto);

      expect(response.data).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return comment by id', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      mockCommentsService.findOne.mockResolvedValue(mockComment);

      const response = await controller.findOne(findOneDto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockComment);
      expect(mockCommentsService.findOne).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null data when comment not found', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439099' };
      mockCommentsService.findOne.mockResolvedValue(null);

      const response = await controller.findOne(findOneDto);

      expect(response.data).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a comment and return wrapped response', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      const dto: UpdateCommentDto = { content: 'Updated content' } as any;
      const updated = { ...mockComment, content: 'Updated content' };
      mockCommentsService.update.mockResolvedValue(updated);

      const response = await controller.update(findOneDto, dto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(updated);
      expect(mockCommentsService.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        dto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a comment and return success response', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      mockCommentsService.remove.mockResolvedValue(mockComment);

      const response = await controller.remove(findOneDto);

      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
      expect(mockCommentsService.remove).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });
  });
});
