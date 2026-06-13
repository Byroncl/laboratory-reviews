import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientResponseDto } from './dto/client-response.dto';
import { ApiResponse as ApiRes } from '../../core/dto/api.response';
import { Auth } from '../../core/decorators/auth.decorator';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @ApiOperation({ summary: 'Create a new client' })
  @ApiBody({ type: CreateClientDto })
  @ApiResponse({ status: 201, description: 'Client created successfully', type: ClientResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Post()
  async create(@Body() createClientDto: CreateClientDto) {
    const client = await this.clientsService.create(createClientDto);
    return ApiRes.success(client, 'Client created successfully');
  }

  @Auth()
  @ApiOperation({ summary: 'Get all clients' })
  @ApiResponse({ status: 200, description: 'List of clients', type: [ClientResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  async findAll() {
    const clients = await this.clientsService.findAll();
    return ApiRes.success(clients);
  }

  @Auth()
  @ApiOperation({ summary: 'Get a client by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Client MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Client found', type: ClientResponseDto })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get(':id')
  async findOne(@Param() findOneDto: FindOneDto) {
    const client = await this.clientsService.findOne(findOneDto.id);
    return ApiRes.success(client);
  }

  @Auth()
  @ApiOperation({ summary: 'Update a client' })
  @ApiParam({ name: 'id', type: 'string', description: 'Client MongoDB ObjectId' })
  @ApiBody({ type: UpdateClientDto })
  @ApiResponse({ status: 200, description: 'Client updated successfully', type: ClientResponseDto })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put(':id')
  async update(
    @Param() findOneDto: FindOneDto,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    const client = await this.clientsService.update(
      findOneDto.id,
      updateClientDto,
    );
    return ApiRes.success(client, 'Client updated successfully');
  }

  @Auth()
  @ApiOperation({ summary: 'Delete a client' })
  @ApiParam({ name: 'id', type: 'string', description: 'Client MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Client deleted successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Delete(':id')
  async remove(@Param() findOneDto: FindOneDto) {
    await this.clientsService.remove(findOneDto.id);
    return ApiRes.success(null, 'Client deleted successfully');
  }
}
