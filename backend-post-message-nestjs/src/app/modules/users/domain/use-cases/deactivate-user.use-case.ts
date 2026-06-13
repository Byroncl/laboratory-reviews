import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../schemas/user.schema';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class DeactivateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepository.deactivate(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
