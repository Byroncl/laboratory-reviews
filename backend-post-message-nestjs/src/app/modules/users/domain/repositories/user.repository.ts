import { CreateUserDto } from 'src/app/modules/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/app/modules/users/dto/update-user.dto';
import { User } from '../../schemas/user.schema';
import { PaginatedResponse } from 'src/app/core/dto/pagination.dto';

export abstract class UserRepository {
  abstract create(createUserDto: CreateUserDto): Promise<User>;
  abstract findOneByUsername(username: string): Promise<User | null>;
  abstract findOneById(id: string): Promise<User | null>;
  abstract findAll(): Promise<User[]>;
  abstract findAllPaginated(skip: number, limit: number): Promise<PaginatedResponse<User>>;
  abstract update(id: string, updateUserDto: UpdateUserDto): Promise<User | null>;
  abstract remove(id: string): Promise<User | null>;
  abstract updateLanguagePreference(
    id: string,
    language: 'en' | 'es',
  ): Promise<User | null>;
  abstract assignRole(id: string, roleId: string): Promise<User | null>;
  abstract changePassword(id: string, newPasswordHash: string): Promise<User | null>;
  abstract findOneByEmail(email: string): Promise<User | null>;
  abstract activate(id: string): Promise<User | null>;
  abstract deactivate(id: string): Promise<User | null>;
  abstract getStats(): Promise<{ total: number; active: number; verified: number }>;
  abstract updateLastLogin(id: string): Promise<void>;
}
