import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../schemas/user.schema';
import { CreateUserUseCase } from '../domain/use-cases/create-user.use-case';
import { FindAllUsersUseCase } from '../domain/use-cases/find-all-users.use-case';
import { FindAllUsersPaginatedUseCase } from '../domain/use-cases/find-all-users-paginated.use-case';
import { FindUserByUsernameUseCase } from '../domain/use-cases/find-user-by-username.use-case';
import { FindUserByIdUseCase } from '../domain/use-cases/find-user-by-id.use-case';
import { UpdateUserUseCase } from '../domain/use-cases/update-user.use-case';
import { RemoveUserUseCase } from '../domain/use-cases/remove-user.use-case';
import { UpdateLanguagePreferenceUseCase } from '../domain/use-cases/update-language-preference.use-case';
import { AssignRoleUseCase } from '../domain/use-cases/assign-role.use-case';
import { ChangePasswordUseCase } from '../domain/use-cases/change-password.use-case';
import { ActivateUserUseCase } from '../domain/use-cases/activate-user.use-case';
import { DeactivateUserUseCase } from '../domain/use-cases/deactivate-user.use-case';
import { GetUserStatsUseCase } from '../domain/use-cases/get-user-stats.use-case';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { PaginatedResponse } from 'src/app/core/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly findAllUsersPaginatedUseCase: FindAllUsersPaginatedUseCase,
    private readonly findUserByUsernameUseCase: FindUserByUsernameUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly removeUserUseCase: RemoveUserUseCase,
    private readonly updateLanguagePreferenceUseCase: UpdateLanguagePreferenceUseCase,
    private readonly assignRoleUseCase: AssignRoleUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly activateUserUseCase: ActivateUserUseCase,
    private readonly deactivateUserUseCase: DeactivateUserUseCase,
    private readonly getUserStatsUseCase: GetUserStatsUseCase,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.createUserUseCase.execute(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return this.findAllUsersUseCase.execute();
  }

  async findAllPaginated(
    skip: number,
    limit: number,
    filters?: { role?: string; status?: string; email?: string }
  ): Promise<PaginatedResponse<User>> {
    return this.findAllUsersPaginatedUseCase.execute(skip, limit, filters);
  }

  async findOne(id: string): Promise<User | null> {
    return this.findUserByIdUseCase.execute(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.updateUserUseCase.execute(id, updateUserDto);
  }

  async remove(id: string): Promise<User | null> {
    return this.removeUserUseCase.execute(id);
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return this.findUserByUsernameUseCase.execute(username);
  }

  async updateLanguagePreference(
    id: string,
    language: 'en' | 'es',
  ): Promise<User | null> {
    return this.updateLanguagePreferenceUseCase.execute(id, language);
  }

  async assignRole(userId: string, roleId: string): Promise<User | null> {
    return this.assignRoleUseCase.execute(userId, roleId);
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    return this.changePasswordUseCase.execute(id, dto);
  }

  async activate(id: string): Promise<User> {
    return this.activateUserUseCase.execute(id);
  }

  async deactivate(id: string): Promise<User> {
    return this.deactivateUserUseCase.execute(id);
  }

  async getStats(): Promise<{ total: number; active: number; verified: number }> {
    return this.getUserStatsUseCase.execute();
  }
}
