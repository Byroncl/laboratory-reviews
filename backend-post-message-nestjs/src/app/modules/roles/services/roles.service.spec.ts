import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Role } from '../schemas/role.schema';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

describe('RolesService', () => {
  let service: RolesService;

  const mockSave = jest.fn();
  const mockExec = jest.fn();
  const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });
  const mockPopulateChain = jest.fn().mockReturnValue({ populate: mockPopulate });

  const MockRoleModel = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: mockSave,
  })) as any;

  MockRoleModel.find = jest.fn().mockReturnValue({ populate: mockPopulate });
  MockRoleModel.findById = jest.fn().mockReturnValue({ populate: mockPopulate });
  MockRoleModel.findByIdAndUpdate = jest.fn().mockReturnValue({ exec: mockExec });
  MockRoleModel.findByIdAndDelete = jest.fn().mockReturnValue({ exec: mockExec });

  const mockRole = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Admin Role',
    identifier: 'admin-role',
    permissions: [],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: getModelToken(Role.name), useValue: MockRoleModel },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create role with auto-generated identifier', async () => {
      const dto: CreateRoleDto = { name: 'Admin Role' } as any;
      mockSave.mockResolvedValue(mockRole);

      const result = await service.create(dto);

      expect(result).toEqual(mockRole);
      expect(MockRoleModel).toHaveBeenCalledWith(
        expect.objectContaining({ identifier: 'admin-role' }),
      );
    });

    it('should replace spaces with dashes in identifier', async () => {
      const dto: CreateRoleDto = { name: 'Super Admin User' } as any;
      mockSave.mockResolvedValue({ ...mockRole, identifier: 'super-admin-user' });

      await service.create(dto);

      expect(MockRoleModel).toHaveBeenCalledWith(
        expect.objectContaining({ identifier: 'super-admin-user' }),
      );
    });

    it('should propagate save errors', async () => {
      mockSave.mockRejectedValue(new Error('Duplicate identifier'));

      await expect(service.create({ name: 'Admin Role' } as any)).rejects.toThrow(
        'Duplicate identifier',
      );
    });
  });

  describe('findAll', () => {
    it('should return all roles with populated permissions', async () => {
      mockExec.mockResolvedValue([mockRole]);

      const result = await service.findAll();

      expect(result).toEqual([mockRole]);
      expect(MockRoleModel.find).toHaveBeenCalledTimes(1);
      expect(mockPopulate).toHaveBeenCalledWith('permissions');
    });

    it('should return empty array when no roles', async () => {
      mockExec.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return role by id with populated permissions', async () => {
      mockExec.mockResolvedValue(mockRole);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockRole);
      expect(MockRoleModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(mockPopulate).toHaveBeenCalledWith('permissions');
    });

    it('should return null when role not found', async () => {
      mockExec.mockResolvedValue(null);

      const result = await service.findOne('ghost-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const dto: UpdateRoleDto = { name: 'Updated Role' } as any;
      const updated = { ...mockRole, name: 'Updated Role' };
      mockExec.mockResolvedValue(updated);

      const result = await service.update('507f1f77bcf86cd799439011', dto);

      expect(result).toEqual(updated);
      expect(MockRoleModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        dto,
        { new: true },
      );
    });

    it('should return null when role not found for update', async () => {
      mockExec.mockResolvedValue(null);

      const result = await service.update('ghost-id', {} as any);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a role', async () => {
      mockExec.mockResolvedValue(mockRole);

      const result = await service.remove('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockRole);
      expect(MockRoleModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null when role not found for delete', async () => {
      mockExec.mockResolvedValue(null);

      const result = await service.remove('ghost-id');

      expect(result).toBeNull();
    });
  });

  describe('assignPermissions', () => {
    it('should assign permissions to a role and return populated role', async () => {
      const updatedRole = { ...mockRole, permissions: [{ _id: '507f1f77bcf86cd799439022', identifier: 'posts:read' }] };
      mockPopulate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedRole) });
      MockRoleModel.findByIdAndUpdate = jest.fn().mockReturnValue({ populate: mockPopulate });

      const result = await service.assignPermissions(
        '507f1f77bcf86cd799439011',
        ['507f1f77bcf86cd799439022'],
      );

      expect(result).toEqual(updatedRole);
      expect(MockRoleModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        expect.objectContaining({ permissions: expect.any(Array) }),
        { new: true },
      );
    });

    it('should throw NotFoundException when role not found', async () => {
      mockPopulate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      MockRoleModel.findByIdAndUpdate = jest.fn().mockReturnValue({ populate: mockPopulate });

      await expect(
        service.assignPermissions('ghost-id', ['507f1f77bcf86cd799439022']),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('hasPermission', () => {
    it('should return true when role has the permission', async () => {
      const roleWithPerms = {
        ...mockRole,
        permissions: [{ identifier: 'posts:read' }],
      };
      mockExec.mockResolvedValue(roleWithPerms);
      MockRoleModel.findById = jest.fn().mockReturnValue({ populate: mockPopulate });
      mockPopulate.mockReturnValue({ exec: mockExec });

      const result = await service.hasPermission('507f1f77bcf86cd799439011', 'posts:read');

      expect(result).toBe(true);
    });

    it('should return false when role does not have the permission', async () => {
      const roleWithPerms = {
        ...mockRole,
        permissions: [{ identifier: 'posts:read' }],
      };
      mockExec.mockResolvedValue(roleWithPerms);
      MockRoleModel.findById = jest.fn().mockReturnValue({ populate: mockPopulate });
      mockPopulate.mockReturnValue({ exec: mockExec });

      const result = await service.hasPermission('507f1f77bcf86cd799439011', 'posts:delete');

      expect(result).toBe(false);
    });

    it('should return false when role not found', async () => {
      mockExec.mockResolvedValue(null);
      MockRoleModel.findById = jest.fn().mockReturnValue({ populate: mockPopulate });
      mockPopulate.mockReturnValue({ exec: mockExec });

      const result = await service.hasPermission('ghost-id', 'posts:read');

      expect(result).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when role has all required permissions', async () => {
      const roleWithPerms = {
        ...mockRole,
        permissions: [
          { identifier: 'posts:read' },
          { identifier: 'posts:create' },
        ],
      };
      mockExec.mockResolvedValue(roleWithPerms);
      MockRoleModel.findById = jest.fn().mockReturnValue({ populate: mockPopulate });
      mockPopulate.mockReturnValue({ exec: mockExec });

      const result = await service.hasAllPermissions('507f1f77bcf86cd799439011', ['posts:read', 'posts:create']);

      expect(result).toBe(true);
    });

    it('should return false when role is missing one permission', async () => {
      const roleWithPerms = {
        ...mockRole,
        permissions: [{ identifier: 'posts:read' }],
      };
      mockExec.mockResolvedValue(roleWithPerms);
      MockRoleModel.findById = jest.fn().mockReturnValue({ populate: mockPopulate });
      mockPopulate.mockReturnValue({ exec: mockExec });

      const result = await service.hasAllPermissions('507f1f77bcf86cd799439011', ['posts:read', 'posts:delete']);

      expect(result).toBe(false);
    });
  });
});
