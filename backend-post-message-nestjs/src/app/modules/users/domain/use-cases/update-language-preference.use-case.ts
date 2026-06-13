import { Injectable } from '@nestjs/common';
import { User } from '../../schemas/user.schema';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UpdateLanguagePreferenceUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string, language: 'en' | 'es'): Promise<User | null> {
    return this.userRepository.updateLanguagePreference(id, language);
  }
}
