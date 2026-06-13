import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  const validPayload = {
    name: 'John',
    lastname: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password_hash: 'Secret@123',
    type: 'admin',
  };

  it('should pass with all valid fields', async () => {
    const dto = plainToInstance(CreateUserDto, validPayload);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject an invalid email', async () => {
    const dto = plainToInstance(CreateUserDto, { ...validPayload, email: 'not-an-email' });
    const errors = await validate(dto);
    const emailError = errors.find((e) => e.property === 'email');
    expect(emailError).toBeDefined();
  });

  it('should reject a name shorter than 2 characters', async () => {
    const dto = plainToInstance(CreateUserDto, { ...validPayload, name: 'J' });
    const errors = await validate(dto);
    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError).toBeDefined();
  });

  it('should reject a username shorter than 3 characters', async () => {
    const dto = plainToInstance(CreateUserDto, { ...validPayload, username: 'jo' });
    const errors = await validate(dto);
    const usernameError = errors.find((e) => e.property === 'username');
    expect(usernameError).toBeDefined();
  });

  it('should trim whitespace from name via Transform', async () => {
    const dto = plainToInstance(CreateUserDto, { ...validPayload, name: '  John  ' });
    expect(dto.name).toBe('John');
  });

  it('should lowercase email via Transform', async () => {
    const dto = plainToInstance(CreateUserDto, { ...validPayload, email: 'JOHN@EXAMPLE.COM' });
    expect(dto.email).toBe('john@example.com');
  });
});
