import { Controller, Post, Body, Put, Param, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ApiResponse } from '../../core/dto/api.response';
import { AuthGuard } from '@nestjs/passport';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  async create(@Body() createClientDto: CreateClientDto) {
    const client = await this.clientsService.create(createClientDto);
    return ApiResponse.success(client, 'Client created successfully');
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    const client = await this.clientsService.update(id, updateClientDto);
    return ApiResponse.success(client, 'Client updated successfully');
  }
}
