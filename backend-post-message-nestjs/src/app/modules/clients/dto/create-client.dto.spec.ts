import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateClientDto } from './create-client.dto';

describe('CreateClientDto', () => {
  const validPayload = {
    name: 'Jane',
    lastname: 'Smith',
    username: 'janesmith',
    email: 'jane@example.com',
    password_hash: 'Secret@123',
    type: 'standard',
  };

  it('should pass with all valid fields', async () => {
    const dto = plainToInstance(CreateClientDto, validPayload);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject an invalid email', async () => {
    const dto = plainToInstance(CreateClientDto, { ...validPayload, email: 'bad' });
    const errors = await validate(dto);
    expect(errors.find((e) => e.property === 'email')).toBeDefined();
  });

  it('should lowercase email via Transform', async () => {
    const dto = plainToInstance(CreateClientDto, { ...validPayload, email: 'JANE@EXAMPLE.COM' });
    expect(dto.email).toBe('jane@example.com');
  });

  it('should trim name via Transform', async () => {
    const dto = plainToInstance(CreateClientDto, { ...validPayload, name: '  Jane  ' });
    expect(dto.name).toBe('Jane');
  });
});
