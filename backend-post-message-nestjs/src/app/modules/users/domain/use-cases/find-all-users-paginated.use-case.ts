import { Injectable } from '@nestjs/common';
import { User } from '../../schemas/user.schema';
import { UserRepository } from '../repositories/user.repository';
import { PaginatedResponse } from 'src/app/core/dto/pagination.dto';

@Injectable()
export class FindAllUsersPaginatedUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    skip: number,
    limit: number,
    filters?: { role?: string; status?: string; email?: string }
  ): Promise<PaginatedResponse<User>> {
    return this.userRepository.findAllPaginated(skip, limit, filters);
  }
}
