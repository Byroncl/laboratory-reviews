import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let mockPermissionsService: jest.Mocked<PermissionsService>;

  const mockPermission = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Read Posts',
    identifier: 'read-posts',
  } as any;

  beforeEach(async () => {
    mockPermissionsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        { provide: PermissionsService, useValue: mockPermissionsService },
      ],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a permission and return wrapped response', async () => {
      const dto: CreatePermissionDto = { name: 'Read Posts' } as any;
      mockPermissionsService.create.mockResolvedValue(mockPermission);

      const response = await controller.create(dto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockPermission);
      expect(mockPermissionsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all permissions', async () => {
      mockPermissionsService.findAll.mockResolvedValue([mockPermission]);

      const response = await controller.findAll();

      expect(response.success).toBe(true);
      expect(response.data).toEqual([mockPermission]);
    });

    it('should return empty array when no permissions', async () => {
      mockPermissionsService.findAll.mockResolvedValue([]);

      const response = await controller.findAll();

      expect(response.data).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return permission by id', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      mockPermissionsService.findOne.mockResolvedValue(mockPermission);

      const response = await controller.findOne(findOneDto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockPermission);
      expect(mockPermissionsService.findOne).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null data when permission not found', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439099' };
      mockPermissionsService.findOne.mockResolvedValue(null);

      const response = await controller.findOne(findOneDto);

      expect(response.data).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a permission and return wrapped response', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      const dto: UpdatePermissionDto = { name: 'Updated Permission' } as any;
      const updated = { ...mockPermission, name: 'Updated Permission' };
      mockPermissionsService.update.mockResolvedValue(updated);

      const response = await controller.update(findOneDto, dto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(updated);
      expect(mockPermissionsService.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        dto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a permission and return success response', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      mockPermissionsService.remove.mockResolvedValue(mockPermission);

      const response = await controller.remove(findOneDto);

      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
      expect(mockPermissionsService.remove).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });
  });
});
