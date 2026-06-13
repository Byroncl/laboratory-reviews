import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RolesService } from './roles.service';
import { Role } from '../schemas/role.schema';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

describe('RolesService', () => {
  let service: RolesService;

  const mockSave = jest.fn();
  const mockExec = jest.fn();
  const mockPopulate = jest.fn().mockReturnValue({ exec: mockExec });

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
});
