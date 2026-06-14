import { Injectable } from '@nestjs/common';
import { ClientEntity } from '../../domain/entities/client.entity';
import { ClientResponseDto } from '../../application/dtos/client-response.dto';
import { IClient } from '../../interfaces/client.interface';

@Injectable()
export class ClientMapper {
  toDomain(raw: any): ClientEntity {
    return new ClientEntity({
      _id: raw._id?.toString(),
      name: raw.name,
      lastname: raw.lastname,
      username: raw.username,
      email: raw.email,
      password_hash: raw.password_hash,
      type: raw.type,
      isActive: raw.isActive !== false,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  toResponse(entity: ClientEntity): ClientResponseDto {
    return {
      _id: entity._id,
      name: entity.name,
      lastname: entity.lastname,
      username: entity.username,
      email: entity.email,
      type: entity.type,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  toResponseList(entities: ClientEntity[]): ClientResponseDto[] {
    return entities.map(e => this.toResponse(e));
  }

  toPersistence(entity: ClientEntity): any {
    return {
      name: entity.name,
      lastname: entity.lastname,
      username: entity.username,
      email: entity.email,
      password_hash: entity.password_hash,
      type: entity.type,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
