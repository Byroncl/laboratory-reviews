import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../schemas/user.schema';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class ActivateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepository.activate(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
