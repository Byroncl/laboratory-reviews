import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ApiResponse } from '../../core/dto/api.response';
import { AuthGuard } from '@nestjs/passport';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  async create(@Body() createClientDto: CreateClientDto) {
    const client = await this.clientsService.create(createClientDto);
    return ApiResponse.success(client, 'Client created successfully');
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll() {
    const clients = await this.clientsService.findAll();
    return ApiResponse.success(clients);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param() findOneDto: FindOneDto) {
    const client = await this.clientsService.findOne(findOneDto.id);
    return ApiResponse.success(client);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(
    @Param() findOneDto: FindOneDto,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    const client = await this.clientsService.update(
      findOneDto.id,
      updateClientDto,
    );
    return ApiResponse.success(client, 'Client updated successfully');
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param() findOneDto: FindOneDto) {
    await this.clientsService.remove(findOneDto.id);
    return ApiResponse.success(null, 'Client deleted successfully');
  }
}
