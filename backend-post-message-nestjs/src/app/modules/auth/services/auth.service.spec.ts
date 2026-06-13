import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('hashed'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: jest.Mocked<UsersService>;
  let mockJwtService: jest.Mocked<JwtService>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'johndoe',
    password_hash: 'hashed_password',
    name: 'John',
    type: 'user',
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockUsersService = {
      findOneByUsername: jest.fn(),
    } as any;

    mockJwtService = {
      sign: jest.fn().mockReturnValue('signed_token'),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password_hash when credentials are valid', async () => {
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValue(true);
      mockUsersService.findOneByUsername.mockResolvedValue(mockUser);

      const result = await service.validateUser('johndoe', 'correct_password');

      expect(result).toBeDefined();
      expect(result.username).toBe('johndoe');
      expect(result.password_hash).toBeUndefined();
    });

    it('should return null when user is not found', async () => {
      mockUsersService.findOneByUsername.mockResolvedValue(null);

      const result = await service.validateUser('nobody', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password does not match', async () => {
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValue(false);
      mockUsersService.findOneByUsername.mockResolvedValue(mockUser);

      const result = await service.validateUser('johndoe', 'wrong_password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access_token', async () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        username: 'johndoe',
      };

      const result = await service.login(user);

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('signed_token');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        username: user.username,
        sub: user._id,
        type: 'user',
      });
    });
  });
});
