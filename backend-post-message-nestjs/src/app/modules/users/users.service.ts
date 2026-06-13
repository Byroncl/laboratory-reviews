import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { CreateUserUseCase } from './domain/use-cases/create-user.use-case';
import { FindAllUsersUseCase } from './domain/use-cases/find-all-users.use-case';
import { FindUserByUsernameUseCase } from './domain/use-cases/find-user-by-username.use-case';
import { FindUserByIdUseCase } from './domain/use-cases/find-user-by-id.use-case';
import { UpdateUserUseCase } from './domain/use-cases/update-user.use-case';
import { RemoveUserUseCase } from './domain/use-cases/remove-user.use-case';

@Injectable()
export class UsersService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly findUserByUsernameUseCase: FindUserByUsernameUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly removeUserUseCase: RemoveUserUseCase,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.createUserUseCase.execute(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return this.findAllUsersUseCase.execute();
  }

  async findOne(id: string): Promise<User | undefined> {
    return this.findUserByIdUseCase.execute(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.updateUserUseCase.execute(id, updateUserDto);
  }

  async remove(id: string): Promise<User> {
    return this.removeUserUseCase.execute(id);
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    return this.findUserByUsernameUseCase.execute(username);
  }
}
