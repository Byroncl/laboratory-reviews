import { UserRepository } from './user.repository';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';

/**
 * UserRepository is an abstract class that defines the domain contract.
 * These tests verify that a concrete implementation satisfies the interface
 * by using an in-memory stub.
 */
class InMemoryUserRepository extends UserRepository {
  private users: any[] = [];

  async create(createUserDto: CreateUserDto): Promise<any> {
    const user = { _id: 'generated-id', ...createUserDto, isActive: true };
    this.users.push(user);
    return user;
  }

  async findOneByUsername(username: string): Promise<any | null> {
    return this.users.find((u) => u.username === username) ?? null;
  }

  async findOneById(id: string): Promise<any | null> {
    return this.users.find((u) => u._id === id) ?? null;
  }

  async findAll(): Promise<any[]> {
    return [...this.users];
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<any | null> {
    const index = this.users.findIndex((u) => u._id === id);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...updateUserDto };
    return this.users[index];
  }

  async remove(id: string): Promise<any | null> {
    const index = this.users.findIndex((u) => u._id === id);
    if (index === -1) return null;
    const [removed] = this.users.splice(index, 1);
    return removed;
  }
}

describe('UserRepository (abstract contract)', () => {
  let repository: InMemoryUserRepository;

  const createDto: CreateUserDto = {
    name: 'John',
    lastname: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password_hash: 'secret',
    type: 'admin',
  };

  beforeEach(() => {
    repository = new InMemoryUserRepository();
  });

  it('should be instantiable via a concrete implementation', () => {
    expect(repository).toBeDefined();
    expect(repository).toBeInstanceOf(UserRepository);
  });

  describe('create', () => {
    it('should create and persist a user', async () => {
      const user = await repository.create(createDto);

      expect(user).toBeDefined();
      expect(user.username).toBe('johndoe');
    });
  });

  describe('findAll', () => {
    it('should return all persisted users', async () => {
      await repository.create(createDto);
      await repository.create({ ...createDto, username: 'janedoe', email: 'jane@example.com' });

      const users = await repository.findAll();

      expect(users).toHaveLength(2);
    });

    it('should return empty array when no users', async () => {
      const users = await repository.findAll();
      expect(users).toEqual([]);
    });
  });

  describe('findOneById', () => {
    it('should return user by id', async () => {
      const created = await repository.create(createDto);

      const found = await repository.findOneById(created._id);

      expect(found).toBeDefined();
      expect(found?._id).toBe(created._id);
    });

    it('should return null for unknown id', async () => {
      const result = await repository.findOneById('unknown-id');
      expect(result).toBeNull();
    });
  });

  describe('findOneByUsername', () => {
    it('should return user by username', async () => {
      await repository.create(createDto);

      const found = await repository.findOneByUsername('johndoe');

      expect(found).toBeDefined();
      expect(found?.username).toBe('johndoe');
    });

    it('should return null for unknown username', async () => {
      const result = await repository.findOneByUsername('nobody');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const created = await repository.create(createDto);
      const updateDto: UpdateUserDto = { name: 'John Updated' };

      const updated = await repository.update(created._id, updateDto);

      expect(updated?.name).toBe('John Updated');
    });

    it('should return null when updating non-existent user', async () => {
      const result = await repository.update('ghost-id', { name: 'Ghost' });
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove an existing user and return it', async () => {
      const created = await repository.create(createDto);

      const removed = await repository.remove(created._id);

      expect(removed?._id).toBe(created._id);

      const afterRemove = await repository.findOneById(created._id);
      expect(afterRemove).toBeNull();
    });

    it('should return null when removing non-existent user', async () => {
      const result = await repository.remove('ghost-id');
      expect(result).toBeNull();
    });
  });
});
