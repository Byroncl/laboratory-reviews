import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { PermissionsService } from '../services/permissions.service';
import { PermissionsGateway } from '../gateways/permissions.gateway';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { PermissionResponseDto } from '../dto/permission-response.dto';
import { ApiResponse as ApiRes } from '../../../core/dto/api.response';
import { Auth } from '../../../core/decorators/auth.decorator';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';
import { TranslationService } from '../../../core/utils/translation.service';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../core/decorators/current-user.decorator';
import { AuditActionDecorator } from '../../../core/decorators/audit-action.decorator';
import { AuditAction, EntityType } from '../../audit/schemas/audit-log.schema';
import {
  PERMISSIONS_SWAGGER,
  PERMISSIONS_RESPONSE_DESCRIPTIONS,
  PERMISSIONS_PARAM_DESCRIPTIONS,
  PERMISSIONS_MESSAGES,
} from '../constants/permissions.constants';

@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly permissionsGateway: PermissionsGateway,
    private readonly i18n: TranslationService,
  ) {}

  @Auth()
  @AuditActionDecorator(AuditAction.CREATE, EntityType.PERMISSION)
  @ApiOperation(PERMISSIONS_SWAGGER.CREATE)
  @ApiBody({ type: CreatePermissionDto })
  @ApiResponse({
    status: 201,
    description: PERMISSIONS_RESPONSE_DESCRIPTIONS.CREATED,
    type: PermissionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: PERMISSIONS_RESPONSE_DESCRIPTIONS.VALIDATION_FAILED,
  })
  @ApiResponse({
    status: 401,
    description: PERMISSIONS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto, @CurrentUser() currentUser: CurrentUserPayload) {
    const permission = await this.permissionsService.create(createPermissionDto);
    this.permissionsGateway.notifyPermissionCreated(permission, currentUser.username);
    return ApiRes.success(permission, this.i18n.translate(PERMISSIONS_MESSAGES.CREATED));
  }

  @Auth()
  @ApiOperation(PERMISSIONS_SWAGGER.FIND_ALL)
  @ApiResponse({
    status: 200,
    description: PERMISSIONS_RESPONSE_DESCRIPTIONS.LIST,
    type: [PermissionResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: PERMISSIONS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Get()
  async findAll() {
    const permissions = await this.permissionsService.findAll();
    return ApiRes.success(permissions);
  }

  @Auth()
  @ApiOperation(PERMISSIONS_SWAGGER.FIND_ONE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: PERMISSIONS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiResponse({
    status: 200,
    description: PERMISSIONS_RESPONSE_DESCRIPTIONS.FOUND,
    type: PermissionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: PERMISSIONS_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @ApiResponse({
    status: 401,
    description: PERMISSIONS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Get(':id')
  async findOne(@Param() findOneDto: FindOneDto) {
    const permission = await this.permissionsService.findOne(findOneDto.id);
    return ApiRes.success(permission);
  }

  @Auth()
  @AuditActionDecorator(AuditAction.UPDATE, EntityType.PERMISSION, { captureSnapshot: true })
  @ApiOperation(PERMISSIONS_SWAGGER.UPDATE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: PERMISSIONS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiBody({ type: UpdatePermissionDto })
  @ApiResponse({
    status: 200,
    description: PERMISSIONS_RESPONSE_DESCRIPTIONS.UPDATED,
    type: PermissionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: PERMISSIONS_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @ApiResponse({
    status: 401,
    description: PERMISSIONS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Put(':id')
  async update(
    @Param() findOneDto: FindOneDto,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    const permission = await this.permissionsService.update(
      findOneDto.id,
      updatePermissionDto,
    );
    this.permissionsGateway.notifyPermissionUpdated(permission, currentUser.username);
    return ApiRes.success(permission, this.i18n.translate(PERMISSIONS_MESSAGES.UPDATED));
  }

  @Auth()
  @AuditActionDecorator(AuditAction.DELETE, EntityType.PERMISSION)
  @ApiOperation(PERMISSIONS_SWAGGER.DELETE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: PERMISSIONS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiResponse({
    status: 200,
    description: PERMISSIONS_RESPONSE_DESCRIPTIONS.DELETED,
  })
  @ApiResponse({
    status: 404,
    description: PERMISSIONS_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @ApiResponse({
    status: 401,
    description: PERMISSIONS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Delete(':id')
  async remove(@Param() findOneDto: FindOneDto, @CurrentUser() currentUser: CurrentUserPayload) {
    await this.permissionsService.remove(findOneDto.id);
    this.permissionsGateway.notifyPermissionDeleted(findOneDto.id, currentUser.username);
    return ApiRes.success(null, this.i18n.translate(PERMISSIONS_MESSAGES.DELETED));
  }
}
