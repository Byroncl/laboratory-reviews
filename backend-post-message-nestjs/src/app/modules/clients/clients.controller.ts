import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { ApiResponse } from '../../core/dto/api.response';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  async create(@Body(new ValidationPipe()) createClientDto: CreateClientDto) {
    const client = await this.clientsService.create(createClientDto);
    return ApiResponse.success(client, 'Client created successfully');
  }
}
