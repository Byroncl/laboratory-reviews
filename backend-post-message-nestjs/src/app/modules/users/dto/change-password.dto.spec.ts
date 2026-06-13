import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ChangePasswordDto } from './change-password.dto';

describe('ChangePasswordDto', () => {
  const validPayload = {
    currentPassword: 'OldPassword123!',
    newPassword: 'NewPassword123!',
    confirmPassword: 'NewPassword123!',
  };

  it('should pass with all valid fields', async () => {
    const dto = plainToInstance(ChangePasswordDto, validPayload);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject when currentPassword is empty', async () => {
    const dto = plainToInstance(ChangePasswordDto, {
      ...validPayload,
      currentPassword: '',
    });
    const errors = await validate(dto);
    const err = errors.find((e) => e.property === 'currentPassword');
    expect(err).toBeDefined();
  });

  it('should reject when newPassword is shorter than 8 characters', async () => {
    const dto = plainToInstance(ChangePasswordDto, {
      ...validPayload,
      newPassword: 'short',
    });
    const errors = await validate(dto);
    const err = errors.find((e) => e.property === 'newPassword');
    expect(err).toBeDefined();
  });

  it('should reject when confirmPassword is empty', async () => {
    const dto = plainToInstance(ChangePasswordDto, {
      ...validPayload,
      confirmPassword: '',
    });
    const errors = await validate(dto);
    const err = errors.find((e) => e.property === 'confirmPassword');
    expect(err).toBeDefined();
  });
});
