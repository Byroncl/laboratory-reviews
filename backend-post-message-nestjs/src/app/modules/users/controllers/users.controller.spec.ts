import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { UsersGateway } from '../gateways/users.gateway';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';
import { PaginationQueryDto } from '../../../core/dto/pagination.dto';
import { I18nService } from '../../../core/i18n/i18n.service';
import { CurrentUserPayload } from '../../../core/decorators/current-user.decorator';

describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: jest.Mocked<UsersService>;
  let mockI18n: jest.Mocked<I18nService>;
  const mockUsersGateway = {
    notifyUserCreated: jest.fn(),
    notifyUserUpdated: jest.fn(),
    notifyUserDeleted: jest.fn(),
    notifyUserActivated: jest.fn(),
    notifyUserDeactivated: jest.fn(),
    notifyPasswordChanged: jest.fn(),
  };

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
      findAllPaginated: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findOneByUsername: jest.fn(),
      updateLanguagePreference: jest.fn(),
      assignRole: jest.fn(),
      changePassword: jest.fn(),
      activate: jest.fn(),
      deactivate: jest.fn(),
      getStats: jest.fn(),
    } as any;

    mockI18n = {
      translate: jest.fn((key: string) => key),
      getLanguage: jest.fn().mockReturnValue('en'),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: UsersGateway, useValue: mockUsersGateway },
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
    it('should return paginated users wrapped in ApiResponse', async () => {
      const paginationDto: PaginationQueryDto = { skip: 0, limit: 10 };
      const paginatedResult = { items: [mockUser], total: 1, skip: 0, limit: 10 };
      mockUsersService.findAllPaginated.mockResolvedValue(paginatedResult as any);

      const response = await controller.findAll(paginationDto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(paginatedResult);
      expect(mockUsersService.findAllPaginated).toHaveBeenCalledWith(0, 10, expect.any(Object));
    });

    it('should return empty items when no users exist', async () => {
      const paginationDto: PaginationQueryDto = { skip: 0, limit: 10 };
      mockUsersService.findAllPaginated.mockResolvedValue({ items: [], total: 0, skip: 0, limit: 10 } as any);

      const response = await controller.findAll(paginationDto);

      expect((response.data as any).items).toEqual([]);
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

      const response = await controller.update(findOneDto, updateDto, mockCurrentUser);

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

      const response = await controller.remove(findOneDto, mockCurrentUser);

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

  describe('getProfile', () => {
    it('should return current user profile', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const response = await controller.getProfile(mockCurrentUser);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(mockCurrentUser.userId);
    });
  });

  describe('changePassword', () => {
    it('should change password when userId matches', async () => {
      const findOneDto: FindOneDto = { id: mockCurrentUser.userId };
      const dto: ChangePasswordDto = {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
        confirmPassword: 'NewPass123!',
      };
      mockUsersService.changePassword.mockResolvedValue(undefined);

      const response = await controller.changePassword(findOneDto, dto, mockCurrentUser);

      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
      expect(mockUsersService.changePassword).toHaveBeenCalledWith(findOneDto.id, dto);
      expect(mockI18n.translate).toHaveBeenCalledWith('users.password_changed');
    });

    it('should throw BadRequestException when trying to change another user password', async () => {
      const findOneDto: FindOneDto = { id: 'different-user-id' };
      const dto: ChangePasswordDto = {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
        confirmPassword: 'NewPass123!',
      };

      await expect(
        controller.changePassword(findOneDto, dto, mockCurrentUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('activate', () => {
    it('should activate user and return success response', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      const activatedUser = { ...mockUser, isActive: true };
      mockUsersService.activate.mockResolvedValue(activatedUser);

      const response = await controller.activate(findOneDto, mockCurrentUser);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(activatedUser);
      expect(mockUsersService.activate).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockI18n.translate).toHaveBeenCalledWith('users.activated');
    });
  });

  describe('deactivate', () => {
    it('should deactivate user and return success response', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      const deactivatedUser = { ...mockUser, isActive: false };
      mockUsersService.deactivate.mockResolvedValue(deactivatedUser);

      const response = await controller.deactivate(findOneDto, mockCurrentUser);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(deactivatedUser);
      expect(mockUsersService.deactivate).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockI18n.translate).toHaveBeenCalledWith('users.deactivated');
    });
  });

  describe('getStats', () => {
    it('should return user statistics', async () => {
      const stats = { total: 100, active: 80, verified: 50 };
      mockUsersService.getStats.mockResolvedValue(stats);

      const response = await controller.getStats();

      expect(response.success).toBe(true);
      expect(response.data).toEqual(stats);
      expect((response.data as any).total).toBe(100);
      expect(mockUsersService.getStats).toHaveBeenCalledTimes(1);
    });
  });
});
