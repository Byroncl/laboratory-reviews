import { Injectable } from '@nestjs/common';
import { User } from '../../schemas/user.schema';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class AssignRoleUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, roleId: string): Promise<User | null> {
    return this.userRepository.assignRole(userId, roleId);
  }
}
