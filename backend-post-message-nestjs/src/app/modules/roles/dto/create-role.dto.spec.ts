import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateRoleDto } from './create-role.dto';

describe('CreateRoleDto', () => {
  const validPayload = {
    name: 'Administrator',
    permissions: ['507f1f77bcf86cd799439011'],
  };

  it('should pass with valid fields', async () => {
    const dto = plainToInstance(CreateRoleDto, validPayload);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject an empty name', async () => {
    const dto = plainToInstance(CreateRoleDto, { ...validPayload, name: '' });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'name')).toBeDefined();
  });

  it('should trim name via Transform', async () => {
    const dto = plainToInstance(CreateRoleDto, { ...validPayload, name: '  Admin  ' });
    expect(dto.name).toBe('Admin');
  });

  it('should reject a permissions entry that is not a string', async () => {
    const dto = plainToInstance(CreateRoleDto, { ...validPayload, permissions: [123] });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'permissions')).toBeDefined();
  });
});
