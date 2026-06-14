import { AuditLogEntity } from '../../../src/app/modules/audit/domain/entities/audit-log.entity';
import { AuditAction, EntityType, AuditStatus } from '../../../src/app/modules/audit/constants/audit.constants';

describe('AuditLogEntity', () => {
  const validProps = {
    userId: 'user-123',
    action: AuditAction.CREATE,
    entityType: EntityType.POST,
    entityId: 'post-456',
    status: AuditStatus.SUCCESS,
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    message: 'Post creado exitosamente',
  };

  describe('constructor', () => {
    it('should create an audit log entity with valid properties', () => {
      const entity = new AuditLogEntity(validProps);

      expect(entity).toBeDefined();
      expect(entity.userId).toBe(validProps.userId);
      expect(entity.action).toBe(validProps.action);
      expect(entity.entityType).toBe(validProps.entityType);
      expect(entity.entityId).toBe(validProps.entityId);
      expect(entity.status).toBe(validProps.status);
      expect(entity.ipAddress).toBe(validProps.ipAddress);
      expect(entity.userAgent).toBe(validProps.userAgent);
      expect(entity.message).toBe(validProps.message);
      expect(entity.createdAt).toBeInstanceOf(Date);
    });

    it('should set createdAt to current date if not provided', () => {
      const beforeCreate = new Date();
      const entity = new AuditLogEntity(validProps);
      const afterCreate = new Date();

      expect(entity.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(entity.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('should accept custom createdAt date', () => {
      const customDate = new Date('2024-01-01');
      const entity = new AuditLogEntity({
        ...validProps,
        createdAt: customDate,
      });

      expect(entity.createdAt).toBe(customDate);
    });

    it('should keep the _id if provided', () => {
      const customId = 'audit-id-789';
      const entity = new AuditLogEntity({
        ...validProps,
        _id: customId,
      });

      expect(entity._id).toBe(customId);
    });
  });

  describe('isSuccess', () => {
    it('should return true when status is SUCCESS', () => {
      const entity = new AuditLogEntity(validProps);
      expect(entity.isSuccess()).toBe(true);
    });

    it('should return false when status is FAILURE', () => {
      const entity = new AuditLogEntity({
        ...validProps,
        status: AuditStatus.FAILURE,
      });

      expect(entity.isSuccess()).toBe(false);
    });

    it('should return false when status is PENDING', () => {
      const entity = new AuditLogEntity({
        ...validProps,
        status: AuditStatus.PENDING,
      });

      expect(entity.isSuccess()).toBe(false);
    });
  });

  describe('isFailed', () => {
    it('should return true when status is FAILURE', () => {
      const entity = new AuditLogEntity({
        ...validProps,
        status: AuditStatus.FAILURE,
      });

      expect(entity.isFailed()).toBe(true);
    });

    it('should return false when status is SUCCESS', () => {
      const entity = new AuditLogEntity(validProps);
      expect(entity.isFailed()).toBe(false);
    });
  });

  describe('getElapsedTime', () => {
    it('should return 0 when updatedAt is not provided', () => {
      const entity = new AuditLogEntity(validProps);
      expect(entity.getElapsedTime()).toBe(0);
    });

    it('should return elapsed time in milliseconds', () => {
      const createdAt = new Date('2024-01-01T12:00:00Z');
      const updatedAt = new Date('2024-01-01T12:00:05Z'); // 5 segundos después

      const entity = new AuditLogEntity({
        ...validProps,
        createdAt,
        updatedAt,
      });

      expect(entity.getElapsedTime()).toBe(5000);
    });

    it('should handle elapsed time correctly for different dates', () => {
      const createdAt = new Date('2024-01-01T00:00:00Z');
      const updatedAt = new Date('2024-01-01T00:01:00Z'); // 1 minuto después

      const entity = new AuditLogEntity({
        ...validProps,
        createdAt,
        updatedAt,
      });

      expect(entity.getElapsedTime()).toBe(60000);
    });
  });

  describe('immutability', () => {
    it('should not allow modifying properties', () => {
      const entity = new AuditLogEntity(validProps);

      expect(() => {
        (entity as any).userId = 'different-user';
      }).toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle empty changes object', () => {
      const entity = new AuditLogEntity({
        ...validProps,
        changes: {},
      });

      expect(entity.changes).toEqual({});
    });

    it('should handle complex nested changes', () => {
      const complexChanges = {
        nested: {
          deep: {
            value: 'changed',
          },
        },
        array: [1, 2, 3],
      };

      const entity = new AuditLogEntity({
        ...validProps,
        changes: complexChanges,
      });

      expect(entity.changes).toEqual(complexChanges);
    });

    it('should handle before and after states', () => {
      const before = { title: 'Old Title' };
      const after = { title: 'New Title' };

      const entity = new AuditLogEntity({
        ...validProps,
        before,
        after,
      });

      expect(entity.before).toEqual(before);
      expect(entity.after).toEqual(after);
    });
  });
});
