import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreatePermissionDto } from './create-permission.dto';
import { PermissionType } from '../schemas/permission.schema';

describe('CreatePermissionDto', () => {
  const validPayload = {
    name: 'Create User',
    type: PermissionType.USER,
  };

  it('should pass with valid fields', async () => {
    const dto = plainToInstance(CreatePermissionDto, validPayload);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject an invalid permission type', async () => {
    const dto = plainToInstance(CreatePermissionDto, { ...validPayload, type: 'invalid_type' });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'type')).toBeDefined();
  });

  it('should reject an empty name', async () => {
    const dto = plainToInstance(CreatePermissionDto, { ...validPayload, name: '' });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'name')).toBeDefined();
  });

  it('should trim name via Transform', async () => {
    const dto = plainToInstance(CreatePermissionDto, { ...validPayload, name: '  Create User  ' });
    expect(dto.name).toBe('Create User');
  });
});
