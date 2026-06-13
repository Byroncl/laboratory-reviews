import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PaginationQueryDto } from './pagination.dto';

describe('PaginationQueryDto', () => {
  it('should use default values when no input is provided', async () => {
    const dto = plainToInstance(PaginationQueryDto, {});
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });

  it('should accept valid page and limit', async () => {
    const dto = plainToInstance(PaginationQueryDto, { page: '3', limit: '50' });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(3);
    expect(dto.limit).toBe(50);
  });

  it('should reject page less than 1', async () => {
    const dto = plainToInstance(PaginationQueryDto, { page: '0' });
    const errors = await validate(dto);

    const pageError = errors.find((e) => e.property === 'page');
    expect(pageError).toBeDefined();
    expect(Object.keys(pageError!.constraints!)).toContain('min');
  });

  it('should reject limit greater than 100', async () => {
    const dto = plainToInstance(PaginationQueryDto, { limit: '101' });
    const errors = await validate(dto);

    const limitError = errors.find((e) => e.property === 'limit');
    expect(limitError).toBeDefined();
    expect(Object.keys(limitError!.constraints!)).toContain('max');
  });
});
