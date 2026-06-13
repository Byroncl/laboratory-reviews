import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { CreateUserUseCase } from '../domain/use-cases/create-user.use-case';
import { FindAllUsersUseCase } from '../domain/use-cases/find-all-users.use-case';
import { FindUserByUsernameUseCase } from '../domain/use-cases/find-user-by-username.use-case';
import { FindUserByIdUseCase } from '../domain/use-cases/find-user-by-id.use-case';
import { UpdateUserUseCase } from '../domain/use-cases/update-user.use-case';
import { RemoveUserUseCase } from '../domain/use-cases/remove-user.use-case';
import { UpdateLanguagePreferenceUseCase } from '../domain/use-cases/update-language-preference.use-case';
import { AssignRoleUseCase } from '../domain/use-cases/assign-role.use-case';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;

  const mockCreateUserUseCase = { execute: jest.fn() };
  const mockFindAllUsersUseCase = { execute: jest.fn() };
  const mockFindUserByUsernameUseCase = { execute: jest.fn() };
  const mockFindUserByIdUseCase = { execute: jest.fn() };
  const mockUpdateUserUseCase = { execute: jest.fn() };
  const mockRemoveUserUseCase = { execute: jest.fn() };
  const mockUpdateLanguagePreferenceUseCase = { execute: jest.fn() };
  const mockAssignRoleUseCase = { execute: jest.fn() };

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
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: CreateUserUseCase, useValue: mockCreateUserUseCase },
        { provide: FindAllUsersUseCase, useValue: mockFindAllUsersUseCase },
        {
          provide: FindUserByUsernameUseCase,
          useValue: mockFindUserByUsernameUseCase,
        },
        { provide: FindUserByIdUseCase, useValue: mockFindUserByIdUseCase },
        { provide: UpdateUserUseCase, useValue: mockUpdateUserUseCase },
        { provide: RemoveUserUseCase, useValue: mockRemoveUserUseCase },
        {
          provide: UpdateLanguagePreferenceUseCase,
          useValue: mockUpdateLanguagePreferenceUseCase,
        },
        { provide: AssignRoleUseCase, useValue: mockAssignRoleUseCase },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to CreateUserUseCase', async () => {
      const dto: CreateUserDto = {
        name: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password_hash: 'secret',
        type: 'admin',
      };
      mockCreateUserUseCase.execute.mockResolvedValue(mockUser);

      const result = await service.create(dto);

      expect(result).toEqual(mockUser);
      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(dto);
    });

    it('should propagate errors from CreateUserUseCase', async () => {
      mockCreateUserUseCase.execute.mockRejectedValue(new Error('Duplicate'));

      await expect(
        service.create({} as CreateUserDto),
      ).rejects.toThrow('Duplicate');
    });
  });

  describe('findAll', () => {
    it('should delegate to FindAllUsersUseCase', async () => {
      mockFindAllUsersUseCase.execute.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(result).toEqual([mockUser]);
      expect(mockFindAllUsersUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no users exist', async () => {
      mockFindAllUsersUseCase.execute.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should delegate to FindUserByIdUseCase', async () => {
      mockFindUserByIdUseCase.execute.mockResolvedValue(mockUser);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockUser);
      expect(mockFindUserByIdUseCase.execute).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null when user not found', async () => {
      mockFindUserByIdUseCase.execute.mockResolvedValue(null);

      const result = await service.findOne('507f1f77bcf86cd799439099');

      expect(result).toBeNull();
    });
  });

  describe('findOneByUsername', () => {
    it('should delegate to FindUserByUsernameUseCase', async () => {
      mockFindUserByUsernameUseCase.execute.mockResolvedValue(mockUser);

      const result = await service.findOneByUsername('johndoe');

      expect(result).toEqual(mockUser);
      expect(mockFindUserByUsernameUseCase.execute).toHaveBeenCalledWith(
        'johndoe',
      );
    });

    it('should return null when username not found', async () => {
      mockFindUserByUsernameUseCase.execute.mockResolvedValue(null);

      const result = await service.findOneByUsername('nobody');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should delegate to UpdateUserUseCase', async () => {
      const dto: UpdateUserDto = { name: 'John Updated' };
      const updatedUser = { ...mockUser, name: 'John Updated' };
      mockUpdateUserUseCase.execute.mockResolvedValue(updatedUser);

      const result = await service.update('507f1f77bcf86cd799439011', dto);

      expect(result).toEqual(updatedUser);
      expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        dto,
      );
    });

    it('should return null when user not found', async () => {
      mockUpdateUserUseCase.execute.mockResolvedValue(null);

      const result = await service.update('ghost-id', {});

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delegate to RemoveUserUseCase', async () => {
      mockRemoveUserUseCase.execute.mockResolvedValue(mockUser);

      const result = await service.remove('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockUser);
      expect(mockRemoveUserUseCase.execute).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null when user not found', async () => {
      mockRemoveUserUseCase.execute.mockResolvedValue(null);

      const result = await service.remove('ghost-id');

      expect(result).toBeNull();
    });
  });

  describe('updateLanguagePreference', () => {
    it('should delegate to UpdateLanguagePreferenceUseCase', async () => {
      const updatedUser = { ...mockUser, preferredLanguage: 'es' };
      mockUpdateLanguagePreferenceUseCase.execute.mockResolvedValue(updatedUser);

      const result = await service.updateLanguagePreference(
        '507f1f77bcf86cd799439011',
        'es',
      );

      expect(result).toEqual(updatedUser);
      expect(mockUpdateLanguagePreferenceUseCase.execute).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        'es',
      );
    });

    it('should return null when user not found', async () => {
      mockUpdateLanguagePreferenceUseCase.execute.mockResolvedValue(null);

      const result = await service.updateLanguagePreference('ghost-id', 'en');

      expect(result).toBeNull();
    });
  });

  describe('assignRole', () => {
    it('should delegate to AssignRoleUseCase', async () => {
      const updatedUser = { ...mockUser, role: { _id: '507f1f77bcf86cd799439022' } };
      mockAssignRoleUseCase.execute.mockResolvedValue(updatedUser);

      const result = await service.assignRole(
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439022',
      );

      expect(result).toEqual(updatedUser);
      expect(mockAssignRoleUseCase.execute).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439022',
      );
    });

    it('should return null when user not found', async () => {
      mockAssignRoleUseCase.execute.mockResolvedValue(null);

      const result = await service.assignRole('ghost-id', '507f1f77bcf86cd799439022');

      expect(result).toBeNull();
    });
  });
});
