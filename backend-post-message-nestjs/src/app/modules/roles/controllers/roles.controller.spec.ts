import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';
import { TranslationService } from '../../../core/utils/translation.service';

describe('RolesController', () => {
  let controller: RolesController;
  let mockRolesService: jest.Mocked<RolesService>;

  const mockRole = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Admin Role',
    identifier: 'admin-role',
    permissions: [],
  } as any;

  beforeEach(async () => {
    mockRolesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        { provide: RolesService, useValue: mockRolesService },
        {
          provide: TranslationService,
          useValue: { translate: jest.fn((key: string) => key) },
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a role and return wrapped response', async () => {
      const dto: CreateRoleDto = { name: 'Admin Role' } as any;
      mockRolesService.create.mockResolvedValue(mockRole);

      const response = await controller.create(dto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockRole);
      expect(mockRolesService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      mockRolesService.findAll.mockResolvedValue([mockRole]);

      const response = await controller.findAll();

      expect(response.success).toBe(true);
      expect(response.data).toEqual([mockRole]);
    });

    it('should return empty array when no roles', async () => {
      mockRolesService.findAll.mockResolvedValue([]);

      const response = await controller.findAll();

      expect(response.data).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return role by id', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      mockRolesService.findOne.mockResolvedValue(mockRole);

      const response = await controller.findOne(findOneDto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockRole);
      expect(mockRolesService.findOne).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should return null data when role not found', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439099' };
      mockRolesService.findOne.mockResolvedValue(null);

      const response = await controller.findOne(findOneDto);

      expect(response.data).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a role and return wrapped response', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      const dto: UpdateRoleDto = { name: 'Updated Role' } as any;
      const updated = { ...mockRole, name: 'Updated Role' };
      mockRolesService.update.mockResolvedValue(updated);

      const response = await controller.update(findOneDto, dto);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(updated);
      expect(mockRolesService.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        dto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a role and return success response', async () => {
      const findOneDto: FindOneDto = { id: '507f1f77bcf86cd799439011' };
      mockRolesService.remove.mockResolvedValue(mockRole);

      const response = await controller.remove(findOneDto);

      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
      expect(mockRolesService.remove).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });
  });
});
