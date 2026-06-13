import { CreateUserDto } from 'src/app/modules/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/app/modules/users/dto/update-user.dto';
import { User } from '../../schemas/user.schema';

export abstract class UserRepository {
  abstract create(createUserDto: CreateUserDto): Promise<User>;
  abstract findOneByUsername(username: string): Promise<User | undefined>;
  abstract findOneById(id: string): Promise<User | undefined>;
  abstract findAll(): Promise<User[]>;
  abstract update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
  abstract remove(id: string): Promise<User>;
}
