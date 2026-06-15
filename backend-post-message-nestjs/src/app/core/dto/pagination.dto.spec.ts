import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PaginationQueryDto } from './pagination.dto';

describe('PaginationQueryDto', () => {
  it('should use default values when no input is provided', async () => {
    const dto = plainToInstance(PaginationQueryDto, {});
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.skip).toBe(0);
    expect(dto.limit).toBe(10);
  });

  it('should accept valid skip and limit', async () => {
    const dto = plainToInstance(PaginationQueryDto, { skip: '30', limit: '50' });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.skip).toBe(30);
    expect(dto.limit).toBe(50);
  });

  it('should reject skip less than 0', async () => {
    const dto = plainToInstance(PaginationQueryDto, { skip: '-1' });
    const errors = await validate(dto);

    const skipError = errors.find((e) => e.property === 'skip');
    expect(skipError).toBeDefined();
    expect(Object.keys(skipError!.constraints!)).toContain('min');
  });

  it('should reject limit greater than 100', async () => {
    const dto = plainToInstance(PaginationQueryDto, { limit: '101' });
    const errors = await validate(dto);

    const limitError = errors.find((e) => e.property === 'limit');
    expect(limitError).toBeDefined();
    expect(Object.keys(limitError!.constraints!)).toContain('max');
  });
});
