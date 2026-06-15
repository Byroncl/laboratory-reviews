import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Client, ClientSchema } from './schemas/client.schema';
import { ClientsController } from './controllers/clients.controller';
import { ClientMapper } from './infrastructure/mappers/client.mapper';
import { ClientRepository } from './infrastructure/repositories/client.repository';
import {
  CreateClientUseCase,
  GetClientByIdUseCase,
  GetClientByEmailUseCase,
  GetClientByUsernameUseCase,
  GetAllClientsUseCase,
  UpdateClientUseCase,
  DeleteClientUseCase,
  ClientUseCaseFactory,
} from './application/use-cases/client.use-cases';
import { ClientOrAdminGuard } from './guards/client-or-admin.guard';
import { I18nService } from '../../core/i18n/i18n.service';
import { ClientsService } from './services/clients.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }]),
  ],
  controllers: [ClientsController],
  providers: [
    ClientsService,
    ClientMapper,
    ClientRepository,
    CreateClientUseCase,
    GetClientByIdUseCase,
    GetClientByEmailUseCase,
    GetClientByUsernameUseCase,
    GetAllClientsUseCase,
    UpdateClientUseCase,
    DeleteClientUseCase,
    ClientUseCaseFactory,
    ClientOrAdminGuard,
    I18nService,
  ],
  exports: [ClientsService, ClientRepository, ClientUseCaseFactory],
})
export class ClientsModule {}
