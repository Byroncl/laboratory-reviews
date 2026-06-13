import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class GetUserStatsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<{ total: number; active: number; verified: number }> {
    return this.userRepository.getStats();
  }
}
