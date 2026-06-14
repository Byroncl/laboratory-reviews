import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuditLogRepository } from '../../../src/app/modules/audit/infrastructure/repositories/audit-log.repository';
import { AuditLogMapper } from '../../../src/app/modules/audit/infrastructure/mappers/audit-log.mapper';
import { AuditLog } from '../../../src/app/modules/audit/schemas/audit-log.schema';
import { AuditAction, EntityType, AuditStatus } from '../../../src/app/modules/audit/constants/audit.constants';

describe('AuditLogRepository', () => {
  let repository: AuditLogRepository;
  let mockModel: any;
  let mockMapper: AuditLogMapper;

  const mockAuditLog = {
    _id: 'audit-123',
    userId: 'user-123',
    action: AuditAction.CREATE,
    entityType: EntityType.POST,
    entityId: 'post-456',
    status: AuditStatus.SUCCESS,
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    message: 'Post creado exitosamente',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockModel = {
      create: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
    };

    mockMapper = {
      toDomain: jest.fn(raw => raw) as jest.Mock,
      toResponse: jest.fn(entity => entity) as jest.Mock,
      toPersistence: jest.fn(entity => entity) as jest.Mock,
    } as unknown as AuditLogMapper;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogRepository,
        {
          provide: getModelToken(AuditLog.name),
          useValue: mockModel,
        },
        {
          provide: AuditLogMapper,
          useValue: mockMapper,
        },
      ],
    }).compile();

    repository = module.get<AuditLogRepository>(AuditLogRepository);
  });

  describe('create', () => {
    it('should create and return an audit log', async () => {
      mockModel.create.mockResolvedValue(mockAuditLog);
      (mockMapper.toResponse as jest.Mock).mockReturnValue(mockAuditLog);

      const result = await repository.create(mockAuditLog);

      expect(mockModel.create).toHaveBeenCalledWith(mockAuditLog);
      expect(result).toEqual(mockAuditLog);
    });

    it('should handle creation errors', async () => {
      mockModel.create.mockRejectedValue(new Error('Database error'));

      await expect(repository.create(mockAuditLog)).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should return an audit log by id', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAuditLog),
      });
      (mockMapper.toDomain as jest.Mock).mockReturnValue(mockAuditLog);
      (mockMapper.toResponse as jest.Mock).mockReturnValue(mockAuditLog);

      const result = await repository.findById('audit-123');

      expect(mockModel.findById).toHaveBeenCalledWith('audit-123');
      expect(result).toEqual(mockAuditLog);
    });

    it('should return null if audit log not found', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return audit logs for a specific user', async () => {
      const logs = [mockAuditLog, { ...mockAuditLog, _id: 'audit-124' }];

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(logs),
      });

      mockModel.countDocuments.mockResolvedValue(2);
      (mockMapper.toDomain as jest.Mock).mockImplementation(raw => raw);
      (mockMapper.toResponse as jest.Mock).mockImplementation(entity => entity);

      const result = await repository.findByUserId('user-123', 0, 10);

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockModel.find).toHaveBeenCalledWith({ userId: 'user-123' });
    });

    it('should return empty array if no logs found', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      mockModel.countDocuments.mockResolvedValue(0);

      const result = await repository.findByUserId('user-123', 0, 10);

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should apply pagination correctly', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockAuditLog]),
      });

      mockModel.countDocuments.mockResolvedValue(100);
      (mockMapper.toDomain as jest.Mock).mockImplementation(raw => raw);
      (mockMapper.toResponse as jest.Mock).mockImplementation(entity => entity);

      await repository.findByUserId('user-123', 20, 10);

      const chainedMethods = mockModel.find().sort();
      expect(chainedMethods.skip).toHaveBeenCalledWith(20);
      expect(chainedMethods.limit).toHaveBeenCalledWith(10);
    });
  });

  describe('findAll', () => {
    it('should return all audit logs with filters', async () => {
      const logs = [mockAuditLog];

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(logs),
      });

      mockModel.countDocuments.mockResolvedValue(1);
      (mockMapper.toDomain as jest.Mock).mockImplementation(raw => raw);
      (mockMapper.toResponse as jest.Mock).mockImplementation(entity => entity);

      const filters = { action: AuditAction.CREATE };
      const result = await repository.findAll(0, 10, filters);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should apply date range filter correctly', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      mockModel.countDocuments.mockResolvedValue(0);

      await repository.findAll(0, 10, { startDate, endDate });

      const filterArg = mockModel.find.mock.calls[0][0];
      expect(filterArg.createdAt).toBeDefined();
      expect(filterArg.createdAt.$gte).toEqual(startDate);
      expect(filterArg.createdAt.$lte).toEqual(endDate);
    });
  });

  describe('exportToCsv', () => {
    it('should export audit logs as CSV', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockAuditLog]),
      });

      const result = await repository.exportToCsv();

      expect(result).toContain('ID');
      expect(result).toContain('Usuario');
      expect(result).toContain('Acción');
      expect(result).toContain('audit-123');
      expect(result).toContain('user-123');
    });

    it('should return message when no records found', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await repository.exportToCsv();

      expect(result).toBe('No records found');
    });
  });
});
