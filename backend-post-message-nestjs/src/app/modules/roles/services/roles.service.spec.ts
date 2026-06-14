import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RoleRepository } from '../domain/repositories/role.repository';

describe('RolesService', () => {
  let service: RolesService;
  let mockRoleRepository: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    assignPermissions: jest.Mock;
    hasPermission: jest.Mock;
    hasAllPermissions: jest.Mock;
  };

  const mockRole = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Admin Role',
    identifier: 'admin-role',
    permissions: [],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockRoleRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      assignPermissions: jest.fn(),
      hasPermission: jest.fn(),
      hasAllPermissions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: RoleRepository, useValue: mockRoleRepository },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to RoleRepository.create', async () => {
      mockRoleRepository.create.mockResolvedValue(mockRole);

      const result = await service.create({ name: 'Admin Role' } as any);

      expect(result).toEqual(mockRole);
      expect(mockRoleRepository.create).toHaveBeenCalledWith({ name: 'Admin Role' });
    });

    it('should propagate errors from repository', async () => {
      mockRoleRepository.create.mockRejectedValue(new Error('Duplicate identifier'));

      await expect(service.create({ name: 'Admin Role' } as any)).rejects.toThrow('Duplicate identifier');
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      mockRoleRepository.findAll.mockResolvedValue([mockRole]);

      const result = await service.findAll();

      expect(result).toEqual([mockRole]);
      expect(mockRoleRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no roles', async () => {
      mockRoleRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return role by id', async () => {
      mockRoleRepository.findOne.mockResolvedValue(mockRole);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockRole);
      expect(mockRoleRepository.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should return null when role not found', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('ghost-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should delegate to RoleRepository.update', async () => {
      const updated = { ...mockRole, name: 'Updated Role' };
      mockRoleRepository.update.mockResolvedValue(updated);

      const result = await service.update('507f1f77bcf86cd799439011', { name: 'Updated Role' } as any);

      expect(result).toEqual(updated);
    });

    it('should return null when role not found', async () => {
      mockRoleRepository.update.mockResolvedValue(null);

      const result = await service.update('ghost-id', {} as any);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delegate to RoleRepository.remove', async () => {
      mockRoleRepository.remove.mockResolvedValue(mockRole);

      const result = await service.remove('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockRole);
      expect(mockRoleRepository.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should return null when role not found', async () => {
      mockRoleRepository.remove.mockResolvedValue(null);

      const result = await service.remove('ghost-id');

      expect(result).toBeNull();
    });
  });

  describe('assignPermissions', () => {
    it('should delegate to RoleRepository.assignPermissions', async () => {
      const updatedRole = {
        ...mockRole,
        permissions: [{ _id: '507f1f77bcf86cd799439022', identifier: 'posts:read' }],
      };
      mockRoleRepository.assignPermissions.mockResolvedValue(updatedRole);

      const result = await service.assignPermissions(
        '507f1f77bcf86cd799439011',
        ['507f1f77bcf86cd799439022'],
      );

      expect(result).toEqual(updatedRole);
      expect(mockRoleRepository.assignPermissions).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        ['507f1f77bcf86cd799439022'],
      );
    });

    it('should propagate NotFoundException from repository', async () => {
      mockRoleRepository.assignPermissions.mockRejectedValue(new NotFoundException());

      await expect(
        service.assignPermissions('ghost-id', ['507f1f77bcf86cd799439022']),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('hasPermission', () => {
    it('should return true when role has the permission', async () => {
      mockRoleRepository.hasPermission.mockResolvedValue(true);

      const result = await service.hasPermission('507f1f77bcf86cd799439011', 'posts:read');

      expect(result).toBe(true);
    });

    it('should return false when role does not have the permission', async () => {
      mockRoleRepository.hasPermission.mockResolvedValue(false);

      const result = await service.hasPermission('507f1f77bcf86cd799439011', 'posts:delete');

      expect(result).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when role has all required permissions', async () => {
      mockRoleRepository.hasAllPermissions.mockResolvedValue(true);

      const result = await service.hasAllPermissions(
        '507f1f77bcf86cd799439011',
        ['posts:read', 'posts:create'],
      );

      expect(result).toBe(true);
    });

    it('should return false when role is missing one permission', async () => {
      mockRoleRepository.hasAllPermissions.mockResolvedValue(false);

      const result = await service.hasAllPermissions(
        '507f1f77bcf86cd799439011',
        ['posts:read', 'posts:delete'],
      );

      expect(result).toBe(false);
    });
  });
});
