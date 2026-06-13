import { validate } from 'class-validator';
import { IsStrongPassword } from './is-strong-password.decorator';

class TestDto {
  @IsStrongPassword()
  password: string;
}

describe('IsStrongPassword decorator', () => {
  it('should pass for a strong password', async () => {
    const dto = new TestDto();
    dto.password = 'Secure@123';
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail for a password without uppercase', async () => {
    const dto = new TestDto();
    dto.password = 'secure@123';
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('password');
  });

  it('should fail for a password without a special character', async () => {
    const dto = new TestDto();
    dto.password = 'Secure123';
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('password');
  });

  it('should fail for a password shorter than 8 characters', async () => {
    const dto = new TestDto();
    dto.password = 'Se@1';
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('password');
  });

  it('should include a descriptive default message', async () => {
    const dto = new TestDto();
    dto.password = 'weak';
    const errors = await validate(dto);

    const constraint = errors[0]?.constraints;
    const messages = Object.values(constraint ?? {});
    expect(messages[0]).toMatch(/uppercase/i);
  });
});
