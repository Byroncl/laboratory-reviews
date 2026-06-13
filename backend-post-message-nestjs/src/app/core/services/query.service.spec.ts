import { QueryService } from './query.service';

describe('QueryService', () => {
  let service: QueryService;

  beforeEach(() => {
    service = new QueryService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildQuery', () => {
    it('should build a plain equality query for regular fields', () => {
      const result = service.buildQuery({ status: 'active', type: 'admin' });

      expect(result).toEqual({ status: 'active', type: 'admin' });
    });

    it('should skip null, undefined, and empty string values', () => {
      const result = service.buildQuery({
        name: 'John',
        email: undefined,
        username: null,
        type: '',
      });

      expect(result).toEqual({ name: 'John' });
      expect(Object.keys(result)).toHaveLength(1);
    });

    it('should build a $gt query for __gt operator', () => {
      const result = service.buildQuery({ age__gt: 18 });

      expect(result).toEqual({ age: { $gt: 18 } });
    });

    it('should build a $gte query for __gte operator', () => {
      const result = service.buildQuery({ age__gte: 18 });

      expect(result).toEqual({ age: { $gte: 18 } });
    });

    it('should build a $lt query for __lt operator', () => {
      const result = service.buildQuery({ price__lt: 100 });

      expect(result).toEqual({ price: { $lt: 100 } });
    });

    it('should build a $lte query for __lte operator', () => {
      const result = service.buildQuery({ price__lte: 100 });

      expect(result).toEqual({ price: { $lte: 100 } });
    });

    it('should build a $regex query for __contains operator', () => {
      const result = service.buildQuery({ name__contains: 'john' });

      expect(result).toEqual({ name: { $regex: 'john', $options: 'i' } });
    });

    it('should build a $in query for __in operator with array value', () => {
      const result = service.buildQuery({ status__in: ['active', 'pending'] });

      expect(result).toEqual({ status: { $in: ['active', 'pending'] } });
    });

    it('should wrap a scalar value in array for __in operator', () => {
      const result = service.buildQuery({ status__in: 'active' });

      expect(result).toEqual({ status: { $in: ['active'] } });
    });

    it('should handle a mix of plain and operator fields', () => {
      const result = service.buildQuery({
        type: 'admin',
        age__gte: 18,
        name__contains: 'john',
      });

      expect(result).toEqual({
        type: 'admin',
        age: { $gte: 18 },
        name: { $regex: 'john', $options: 'i' },
      });
    });
  });
});
