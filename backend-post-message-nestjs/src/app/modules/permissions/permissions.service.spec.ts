import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PermissionsService } from './permissions.service';
import { Permission } from './schemas/permission.schema';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

describe('PermissionsService', () => {
  let service: PermissionsService;

  const mockSave = jest.fn();
  const mockExec = jest.fn();

  const MockPermissionModel = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: mockSave,
  })) as any;

  MockPermissionModel.find = jest.fn().mockReturnValue({ exec: mockExec });
  MockPermissionModel.findById = jest.fn().mockReturnValue({ exec: mockExec });
  MockPermissionModel.findByIdAndUpdate = jest.fn().mockReturnValue({ exec: mockExec });
  MockPermissionModel.findByIdAndDelete = jest.fn().mockReturnValue({ exec: mockExec });

  const mockPermission = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Read Posts',
    identifier: 'read-posts',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: getModelToken(Permission.name),
          useValue: MockPermissionModel,
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create permission with auto-generated identifier', async () => {
      const dto: CreatePermissionDto = { name: 'Read Posts' } as any;
      mockSave.mockResolvedValue(mockPermission);

      const result = await service.create(dto);

      expect(result).toEqual(mockPermission);
      expect(MockPermissionModel).toHaveBeenCalledWith(
        expect.objectContaining({ identifier: 'read-posts' }),
      );
    });

    it('should replace spaces with dashes in identifier', async () => {
      const dto: CreatePermissionDto = { name: 'Create New Users' } as any;
      mockSave.mockResolvedValue({ ...mockPermission, identifier: 'create-new-users' });

      await service.create(dto);

      expect(MockPermissionModel).toHaveBeenCalledWith(
        expect.objectContaining({ identifier: 'create-new-users' }),
      );
    });

    it('should propagate save errors', async () => {
      mockSave.mockRejectedValue(new Error('Duplicate identifier'));

      await expect(service.create({ name: 'Read Posts' } as any)).rejects.toThrow(
        'Duplicate identifier',
      );
    });
  });

  describe('findAll', () => {
    it('should return all permissions', async () => {
      mockExec.mockResolvedValue([mockPermission]);

      const result = await service.findAll();

      expect(result).toEqual([mockPermission]);
      expect(MockPermissionModel.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no permissions', async () => {
      mockExec.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return permission by id', async () => {
      mockExec.mockResolvedValue(mockPermission);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockPermission);
      expect(MockPermissionModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null when permission not found', async () => {
      mockExec.mockResolvedValue(null);

      const result = await service.findOne('ghost-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a permission', async () => {
      const dto: UpdatePermissionDto = { name: 'Updated Permission' } as any;
      const updated = { ...mockPermission, name: 'Updated Permission' };
      mockExec.mockResolvedValue(updated);

      const result = await service.update('507f1f77bcf86cd799439011', dto);

      expect(result).toEqual(updated);
      expect(MockPermissionModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        dto,
        { new: true },
      );
    });

    it('should return null when permission not found for update', async () => {
      mockExec.mockResolvedValue(null);

      const result = await service.update('ghost-id', {} as any);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a permission', async () => {
      mockExec.mockResolvedValue(mockPermission);

      const result = await service.remove('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockPermission);
      expect(MockPermissionModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null when permission not found for delete', async () => {
      mockExec.mockResolvedValue(null);

      const result = await service.remove('ghost-id');

      expect(result).toBeNull();
    });
  });
});
