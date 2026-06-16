import { Injectable } from '@nestjs/common';
import { ClientRepository } from '../../infrastructure/repositories/client.repository';
import { IClient, IClientUseCase } from '../../interfaces/client.interface';
import { ClientEntity } from '../../domain/entities/client.entity';
import { CryptoUtils } from '../../../../core/utils/crypto.utils';

@Injectable()
export class CreateClientUseCase {
  constructor(private repository: ClientRepository) {}

  async execute(data: IClient): Promise<IClient> {
    const hashedPassword = await CryptoUtils.hashPassword(data.password_hash);
    const entity = new ClientEntity({ ...data, password_hash: hashedPassword });
    return this.repository.create(entity);
  }
}

@Injectable()
export class GetClientByIdUseCase {
  constructor(private repository: ClientRepository) {}

  async execute(id: string): Promise<IClient | null> {
    return this.repository.findById(id);
  }
}

@Injectable()
export class GetClientByEmailUseCase {
  constructor(private repository: ClientRepository) {}

  async execute(email: string): Promise<IClient | null> {
    return this.repository.findByEmail(email);
  }
}

@Injectable()
export class GetClientByUsernameUseCase {
  constructor(private repository: ClientRepository) {}

  async execute(username: string): Promise<IClient | null> {
    return this.repository.findByUsername(username);
  }
}

@Injectable()
export class GetAllClientsUseCase {
  constructor(private repository: ClientRepository) {}

  async execute(): Promise<IClient[]> {
    return this.repository.findAll();
  }
}

@Injectable()
export class UpdateClientUseCase {
  constructor(private repository: ClientRepository) {}

  async execute(id: string, data: Partial<IClient>): Promise<IClient | null> {
    return this.repository.update(id, data);
  }
}

@Injectable()
export class DeleteClientUseCase {
  constructor(private repository: ClientRepository) {}

  async execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}

@Injectable()
export class ClientUseCaseFactory implements IClientUseCase {
  constructor(
    private createUseCase: CreateClientUseCase,
    private getByIdUseCase: GetClientByIdUseCase,
    private getByEmailUseCase: GetClientByEmailUseCase,
    private getByUsernameUseCase: GetClientByUsernameUseCase,
    private getAllUseCase: GetAllClientsUseCase,
    private updateUseCase: UpdateClientUseCase,
    private deleteUseCase: DeleteClientUseCase,
  ) {}

  async createClient(data: Omit<IClient, '_id' | 'createdAt' | 'updatedAt'>): Promise<IClient> {
    return this.createUseCase.execute(data as IClient);
  }

  async getClientById(id: string): Promise<IClient | null> {
    return this.getByIdUseCase.execute(id);
  }

  async getClientByEmail(email: string): Promise<IClient | null> {
    return this.getByEmailUseCase.execute(email);
  }

  async getClientByUsername(username: string): Promise<IClient | null> {
    return this.getByUsernameUseCase.execute(username);
  }

  async getAllClients(): Promise<IClient[]> {
    return this.getAllUseCase.execute();
  }

  async updateClient(id: string, data: Partial<IClient>): Promise<IClient | null> {
    return this.updateUseCase.execute(id, data);
  }

  async deleteClient(id: string): Promise<void> {
    return this.deleteUseCase.execute(id);
  }
}
