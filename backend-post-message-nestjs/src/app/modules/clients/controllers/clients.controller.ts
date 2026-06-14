import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { ClientUseCaseFactory } from '../application/use-cases/client.use-cases';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { ClientResponseDto } from '../application/dtos/client-response.dto';
import { ApiResponse as ApiRes } from '../../../core/dto/api.response';
import { Auth } from '../../../core/decorators/auth.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../core/decorators/current-user.decorator';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';
import { ClientOrAdminGuard } from '../guards/client-or-admin.guard';
import { I18nService } from '../../../core/i18n/i18n.service';
import {
  CLIENT_SWAGGER,
  CLIENT_RESPONSE_DESCRIPTIONS,
  CLIENT_PARAM_DESCRIPTIONS,
  CLIENT_MESSAGES,
} from '../constants/client.constants';

@ApiTags('Clients')
@Controller('clients')
export class ClientsController {
  constructor(
    private readonly clientUseCase: ClientUseCaseFactory,
    private readonly i18n: I18nService,
  ) {}

  @ApiOperation(CLIENT_SWAGGER.CREATE)
  @ApiBody({ type: CreateClientDto })
  @ApiResponse({
    status: 201,
    description: CLIENT_RESPONSE_DESCRIPTIONS.CREATED,
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: CLIENT_RESPONSE_DESCRIPTIONS.VALIDATION_FAILED,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body(ValidationPipe) createClientDto: CreateClientDto) {
    const client = await this.clientUseCase.createClient(createClientDto);
    return ApiRes.success(client, this.i18n.translate(CLIENT_MESSAGES.CREATED));
  }

  @Auth()
  @UseGuards(ClientOrAdminGuard)
  @ApiOperation(CLIENT_SWAGGER.GET_PROFILE)
  @ApiResponse({
    status: 200,
    description: CLIENT_RESPONSE_DESCRIPTIONS.PROFILE,
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: CLIENT_RESPONSE_DESCRIPTIONS.FORBIDDEN,
  })
  @ApiResponse({
    status: 401,
    description: CLIENT_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Get('profile')
  async getProfile(@CurrentUser() user: CurrentUserPayload) {
    const client = await this.clientUseCase.getClientById(user.userId);
    return ApiRes.success(client);
  }

  @Auth()
  @UseGuards(ClientOrAdminGuard)
  @ApiOperation(CLIENT_SWAGGER.UPDATE_PROFILE)
  @ApiBody({ type: UpdateClientDto })
  @ApiResponse({
    status: 200,
    description: CLIENT_RESPONSE_DESCRIPTIONS.UPDATED,
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: CLIENT_RESPONSE_DESCRIPTIONS.FORBIDDEN,
  })
  @ApiResponse({
    status: 401,
    description: CLIENT_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Put('profile')
  async updateProfile(
    @CurrentUser() user: CurrentUserPayload,
    @Body(ValidationPipe) updateClientDto: UpdateClientDto,
  ) {
    const client = await this.clientUseCase.updateClient(user.userId, updateClientDto);
    return ApiRes.success(client, this.i18n.translate(CLIENT_MESSAGES.UPDATED));
  }

  @Auth()
  @ApiOperation(CLIENT_SWAGGER.GET_ALL)
  @ApiResponse({
    status: 200,
    description: CLIENT_RESPONSE_DESCRIPTIONS.LIST,
    type: [ClientResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: CLIENT_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Get()
  async findAll() {
    const clients = await this.clientUseCase.getAllClients();
    return ApiRes.success(clients);
  }

  @Auth()
  @ApiOperation(CLIENT_SWAGGER.GET_ONE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: CLIENT_PARAM_DESCRIPTIONS.ID,
  })
  @ApiResponse({
    status: 200,
    description: CLIENT_RESPONSE_DESCRIPTIONS.FOUND,
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: CLIENT_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @ApiResponse({
    status: 401,
    description: CLIENT_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Get(':id')
  async findOne(@Param() findOneDto: FindOneDto) {
    const client = await this.clientUseCase.getClientById(findOneDto.id);
    return ApiRes.success(client);
  }

  @Auth()
  @ApiOperation(CLIENT_SWAGGER.UPDATE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: CLIENT_PARAM_DESCRIPTIONS.ID,
  })
  @ApiBody({ type: UpdateClientDto })
  @ApiResponse({
    status: 200,
    description: CLIENT_RESPONSE_DESCRIPTIONS.UPDATED,
    type: ClientResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: CLIENT_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @ApiResponse({
    status: 401,
    description: CLIENT_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Put(':id')
  async update(
    @Param() findOneDto: FindOneDto,
    @Body(ValidationPipe) updateClientDto: UpdateClientDto,
  ) {
    const client = await this.clientUseCase.updateClient(
      findOneDto.id,
      updateClientDto,
    );
    return ApiRes.success(client, this.i18n.translate(CLIENT_MESSAGES.UPDATED));
  }

  @Auth()
  @ApiOperation(CLIENT_SWAGGER.DELETE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: CLIENT_PARAM_DESCRIPTIONS.ID,
  })
  @ApiResponse({
    status: 200,
    description: CLIENT_RESPONSE_DESCRIPTIONS.DELETED,
  })
  @ApiResponse({
    status: 404,
    description: CLIENT_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @ApiResponse({
    status: 401,
    description: CLIENT_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Delete(':id')
  async remove(@Param() findOneDto: FindOneDto) {
    await this.clientUseCase.deleteClient(findOneDto.id);
    return ApiRes.success(null, this.i18n.translate(CLIENT_MESSAGES.DELETED));
  }
}
