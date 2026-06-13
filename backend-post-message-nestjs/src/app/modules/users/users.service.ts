import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { CreateUserUseCase } from './domain/use-cases/create-user.use-case';
import { FindAllUsersUseCase } from './domain/use-cases/find-all-users.use-case';
import { FindUserByUsernameUseCase } from './domain/use-cases/find-user-by-username.use-case';

@Injectable()
export class UsersService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly findUserByUsernameUseCase: FindUserByUsernameUseCase,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.createUserUseCase.execute(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return this.findAllUsersUseCase.execute();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // This assumes you have a use case for updating a user.
    // You would need to create this use case.
    // For now, I will just log a message.
    console.log('update user service method called');
    return null;
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    return this.findUserByUsernameUseCase.execute(username);
  }
}
