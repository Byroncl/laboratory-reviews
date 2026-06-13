import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserMongoRepository } from './user-mongo.repository';
import { User } from '../../schemas/user.schema';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('UserMongoRepository', () => {
  let repository: UserMongoRepository;

  const mockSave = jest.fn();
  const mockExec = jest.fn();

  const MockUserModel = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: mockSave,
  })) as any;

  MockUserModel.findOne = jest.fn().mockReturnValue({ exec: mockExec });
  MockUserModel.findById = jest.fn().mockReturnValue({ exec: mockExec });
  MockUserModel.find = jest.fn().mockReturnValue({ exec: mockExec });
  MockUserModel.findByIdAndUpdate = jest.fn().mockReturnValue({ exec: mockExec });
  MockUserModel.findByIdAndDelete = jest.fn().mockReturnValue({ exec: mockExec });

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John',
    lastname: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password_hash: 'hashed_password',
    type: 'admin',
    isActive: true,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserMongoRepository,
        { provide: getModelToken(User.name), useValue: MockUserModel },
      ],
    }).compile();

    repository = module.get<UserMongoRepository>(UserMongoRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should hash password and save user', async () => {
      const createDto: CreateUserDto = {
        name: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password_hash: 'plaintext',
        type: 'admin',
      };
      mockSave.mockResolvedValue(mockUser);

      const result = await repository.create(createDto);

      expect(result).toEqual(mockUser);
      expect(mockSave).toHaveBeenCalledTimes(1);

      const bcrypt = require('bcrypt');
      expect(bcrypt.hash).toHaveBeenCalledWith('plaintext', 10);
    });

    it('should propagate save errors', async () => {
      const createDto: CreateUserDto = {
        name: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password_hash: 'plaintext',
        type: 'admin',
      };
      mockSave.mockRejectedValue(new Error('Duplicate key'));

      await expect(repository.create(createDto)).rejects.toThrow('Duplicate key');
    });
  });

  describe('findOneByUsername', () => {
    it('should call findOne with username filter', async () => {
      mockExec.mockResolvedValue(mockUser);

      const result = await repository.findOneByUsername('johndoe');

      expect(result).toEqual(mockUser);
      expect(MockUserModel.findOne).toHaveBeenCalledWith({ username: 'johndoe' });
    });

    it('should return null when user not found', async () => {
      mockExec.mockResolvedValue(null);

      const result = await repository.findOneByUsername('ghost');

      expect(result).toBeNull();
    });
  });

  describe('findOneById', () => {
    it('should call findById with the given id', async () => {
      mockExec.mockResolvedValue(mockUser);

      const result = await repository.findOneById('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockUser);
      expect(MockUserModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null when user not found', async () => {
      mockExec.mockResolvedValue(null);

      const result = await repository.findOneById('507f1f77bcf86cd799439099');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockExec.mockResolvedValue([mockUser]);

      const result = await repository.findAll();

      expect(result).toEqual([mockUser]);
      expect(MockUserModel.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no users', async () => {
      mockExec.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should call findByIdAndUpdate with correct arguments', async () => {
      const updateDto: UpdateUserDto = { name: 'John Updated' };
      const updatedUser = { ...mockUser, name: 'John Updated' };
      mockExec.mockResolvedValue(updatedUser);

      const result = await repository.update(
        '507f1f77bcf86cd799439011',
        updateDto,
      );

      expect(result).toEqual(updatedUser);
      expect(MockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateDto,
        { new: true },
      );
    });

    it('should return null when user not found for update', async () => {
      mockExec.mockResolvedValue(null);

      const result = await repository.update('ghost-id', { name: 'Ghost' });

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should call findByIdAndDelete with correct id', async () => {
      mockExec.mockResolvedValue(mockUser);

      const result = await repository.remove('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockUser);
      expect(MockUserModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null when user not found for remove', async () => {
      mockExec.mockResolvedValue(null);

      const result = await repository.remove('ghost-id');

      expect(result).toBeNull();
    });
  });

  describe('updateLanguagePreference', () => {
    it('should call findByIdAndUpdate with preferredLanguage field', async () => {
      const updatedUser = { ...mockUser, preferredLanguage: 'es' };
      mockExec.mockResolvedValue(updatedUser);

      const result = await repository.updateLanguagePreference(
        '507f1f77bcf86cd799439011',
        'es',
      );

      expect(result).toEqual(updatedUser);
      expect(MockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { preferredLanguage: 'es' },
        { new: true },
      );
    });

    it('should return null when user not found', async () => {
      mockExec.mockResolvedValue(null);

      const result = await repository.updateLanguagePreference('ghost-id', 'en');

      expect(result).toBeNull();
    });
  });
});
