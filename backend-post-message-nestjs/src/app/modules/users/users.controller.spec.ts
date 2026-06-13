import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: jest.Mocked<UsersService>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John',
    lastname: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password_hash: 'hashed',
    type: 'admin',
    isActive: true,
  } as any;

  beforeEach(async () => {
    mockUsersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findOneByUsername: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and return wrapped response', async () => {
      const dto: CreateUserDto = {
        name: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password_hash: 'secret',
        type: 'admin',
      };
      mockUsersService.create.mockResolvedValue(mockUser);

      const response = await controller.create(dto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(dto);
    });

    it('should propagate service errors', async () => {
      mockUsersService.create.mockRejectedValue(new Error('Duplicate'));

      await expect(controller.create({} as CreateUserDto)).rejects.toThrow(
        'Duplicate',
      );
    });
  });

  describe('findAll', () => {
    it('should return all users wrapped in ApiResponse', async () => {
      mockUsersService.findAll.mockResolvedValue([mockUser]);

      const response = await controller.findAll();

      expect(response.success).toBe(true);
      expect(response.data).toEqual([mockUser]);
      expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty data when no users exist', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const response = await controller.findAll();

      expect(response.data).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return user by id wrapped in ApiResponse', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const response = await controller.findOne(findOneDto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null data when user not found', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439099' };
      mockUsersService.findOne.mockResolvedValue(null);

      const response = await controller.findOne(findOneDto);

      expect(response.data).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user and return wrapped response', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      const updateDto: UpdateUserDto = { name: 'John Updated' };
      const updatedUser = { ...mockUser, name: 'John Updated' };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const response = await controller.update(findOneDto, updateDto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(updatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a user and return success response', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      mockUsersService.remove.mockResolvedValue(mockUser);

      const response = await controller.remove(findOneDto);

      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
      expect(mockUsersService.remove).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });
  });
});
