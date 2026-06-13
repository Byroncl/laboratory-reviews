import { CreateUserDto } from 'src/app/modules/users/dto/create-user.dto';
import { User } from '../../schemas/user.schema';

export abstract class UserRepository {
  abstract create(createUserDto: CreateUserDto): Promise<User>;
  abstract findOneByUsername(username: string): Promise<User | undefined>;
  abstract findAll(): Promise<User[]>;
}
