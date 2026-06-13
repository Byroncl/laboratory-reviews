import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserUseCase } from './update-user.use-case';
import { UserRepository } from '../repositories/user.repository';
import { UpdateUserDto } from '../../dto/update-user.dto';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John Updated',
    lastname: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password_hash: 'hashed',
    type: 'admin',
    isActive: true,
  } as any;

  beforeEach(async () => {
    mockUserRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOneById: jest.fn(),
      findOneByUsername: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update a user and return the updated entity', async () => {
      const updateDto: UpdateUserDto = { name: 'John Updated' };
      mockUserRepository.update.mockResolvedValue(mockUser);

      const result = await useCase.execute(
        '507f1f77bcf86cd799439011',
        updateDto,
      );

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateDto,
      );
    });

    it('should return null when user is not found', async () => {
      const updateDto: UpdateUserDto = { name: 'Ghost' };
      mockUserRepository.update.mockResolvedValue(null);

      const result = await useCase.execute('507f1f77bcf86cd799439099', updateDto);

      expect(result).toBeNull();
    });

    it('should propagate repository errors', async () => {
      const updateDto: UpdateUserDto = { name: 'Fail' };
      mockUserRepository.update.mockRejectedValue(new Error('DB error'));

      await expect(
        useCase.execute('507f1f77bcf86cd799439011', updateDto),
      ).rejects.toThrow('DB error');
    });
  });
});
