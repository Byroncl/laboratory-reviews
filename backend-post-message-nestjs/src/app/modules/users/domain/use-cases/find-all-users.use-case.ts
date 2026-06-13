import { Injectable } from '@nestjs/common';
import { User } from '../../schemas/user.schema';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class FindAllUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
