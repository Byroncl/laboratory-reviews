import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from '../../schemas/client.schema';
import { IClientRepository, IClient } from '../../interfaces/client.interface';
import { ClientEntity } from '../../domain/entities/client.entity';
import { ClientMapper } from './client.mapper';
import { CLIENT_MESSAGES } from '../../constants/client.constants';

@Injectable()
export class ClientRepository implements IClientRepository {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    private mapper: ClientMapper,
  ) {}

  async create(client: IClient): Promise<IClient> {
    const existingEmail = await this.clientModel.findOne({ email: client.email }).exec();
    if (existingEmail) {
      throw new BadRequestException('Email already exists');
    }

    const existingUsername = await this.clientModel.findOne({ username: client.username }).exec();
    if (existingUsername) {
      throw new BadRequestException('Username already exists');
    }

    const entity = new ClientEntity(client);
    const created = await this.clientModel.create(this.mapper.toPersistence(entity));
    return this.mapper.toResponse(this.mapper.toDomain(created));
  }

  async findById(id: string): Promise<IClient | null> {
    const client = await this.clientModel.findById(id).exec();
    if (!client) return null;
    return this.mapper.toResponse(this.mapper.toDomain(client));
  }

  async findByEmail(email: string): Promise<IClient | null> {
    const client = await this.clientModel.findOne({ email }).exec();
    if (!client) return null;
    return this.mapper.toResponse(this.mapper.toDomain(client));
  }

  async findByUsername(username: string): Promise<IClient | null> {
    const client = await this.clientModel.findOne({ username }).exec();
    if (!client) return null;
    return this.mapper.toResponse(this.mapper.toDomain(client));
  }

  async findAll(): Promise<IClient[]> {
    const clients = await this.clientModel.find().exec();
    return this.mapper.toResponseList(clients.map(c => this.mapper.toDomain(c)));
  }

  async update(id: string, client: Partial<IClient>): Promise<IClient | null> {
    const existing = await this.clientModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException(CLIENT_MESSAGES.NOT_FOUND);
    }

    if (client.email && client.email !== existing.email) {
      const dup = await this.clientModel.findOne({ email: client.email }).exec();
      if (dup) {
        throw new BadRequestException('Email already exists');
      }
    }

    if (client.username && client.username !== existing.username) {
      const dup = await this.clientModel.findOne({ username: client.username }).exec();
      if (dup) {
        throw new BadRequestException('Username already exists');
      }
    }

    const entity = this.mapper.toDomain(existing);
    const updated = entity.update(client);
    const result = await this.clientModel.findByIdAndUpdate(id, this.mapper.toPersistence(updated), {
      new: true,
    });

    return result ? this.mapper.toResponse(this.mapper.toDomain(result)) : null;
  }

  async delete(id: string): Promise<void> {
    const client = await this.clientModel.findById(id).exec();
    if (!client) {
      throw new NotFoundException(CLIENT_MESSAGES.NOT_FOUND);
    }

    await this.clientModel.findByIdAndDelete(id).exec();
  }
}
