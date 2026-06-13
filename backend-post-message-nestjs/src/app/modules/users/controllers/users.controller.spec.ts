import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';
import { I18nService } from '../../../core/i18n/i18n.service';
import { CurrentUserPayload } from '../../../core/decorators/current-user.decorator';

describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: jest.Mocked<UsersService>;
  let mockI18n: jest.Mocked<I18nService>;

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

  const mockCurrentUser: CurrentUserPayload = {
    userId: '507f1f77bcf86cd799439011',
    username: 'johndoe',
    type: 'user',
  };

  beforeEach(async () => {
    mockUsersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findOneByUsername: jest.fn(),
      updateLanguagePreference: jest.fn(),
    } as any;

    mockI18n = {
      translate: jest.fn((key: string) => key),
      getLanguage: jest.fn().mockReturnValue('en'),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: I18nService, useValue: mockI18n },
      ],
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
      expect(mockI18n.translate).toHaveBeenCalledWith('users.created');
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
      expect(mockI18n.translate).toHaveBeenCalledWith('users.updated');
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
      expect(mockI18n.translate).toHaveBeenCalledWith('users.deleted');
    });
  });

  describe('setLanguage', () => {
    it('should update language preference and return success', async () => {
      const updatedUser = { ...mockUser, preferredLanguage: 'es' };
      mockUsersService.updateLanguagePreference.mockResolvedValue(updatedUser);

      const response = await controller.setLanguage('es', mockCurrentUser);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(updatedUser);
      expect(mockUsersService.updateLanguagePreference).toHaveBeenCalledWith(
        mockCurrentUser.userId,
        'es',
      );
      expect(mockI18n.translate).toHaveBeenCalledWith('users.language_updated');
    });

    it('should throw BadRequestException for invalid language', async () => {
      await expect(
        controller.setLanguage('fr', mockCurrentUser),
      ).rejects.toThrow(BadRequestException);

      expect(mockI18n.translate).toHaveBeenCalledWith('users.language_invalid');
    });

    it('should accept "en" as valid language', async () => {
      const updatedUser = { ...mockUser, preferredLanguage: 'en' };
      mockUsersService.updateLanguagePreference.mockResolvedValue(updatedUser);

      const response = await controller.setLanguage('en', mockCurrentUser);

      expect(response.success).toBe(true);
      expect(mockUsersService.updateLanguagePreference).toHaveBeenCalledWith(
        mockCurrentUser.userId,
        'en',
      );
    });
  });
});
