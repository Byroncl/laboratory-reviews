import { Injectable } from '@nestjs/common';
import { User } from '../../schemas/user.schema';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class FindUserByUsernameUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(username: string): Promise<User | undefined> {
    return this.userRepository.findOneByUsername(username);
  }
}
