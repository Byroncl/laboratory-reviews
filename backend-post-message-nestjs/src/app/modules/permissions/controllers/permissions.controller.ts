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
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiBody({ type: CreatePermissionDto })
  @ApiResponse({ status: 201, description: 'Permission created successfully', type: PermissionResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto, @CurrentUser() currentUser: CurrentUserPayload) {
    const permission = await this.permissionsService.create(createPermissionDto);
    this.permissionsGateway.notifyPermissionCreated(permission, currentUser.username);
    return ApiRes.success(permission, this.i18n.translate('permissions.created'));
  }

  @Auth()
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'List of permissions', type: [PermissionResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  async findAll() {
    const permissions = await this.permissionsService.findAll();
    return ApiRes.success(permissions);
  }

  @Auth()
  @ApiOperation({ summary: 'Get a permission by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Permission MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Permission found', type: PermissionResponseDto })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get(':id')
  async findOne(@Param() findOneDto: FindOneDto) {
    const permission = await this.permissionsService.findOne(findOneDto.id);
    return ApiRes.success(permission);
  }

  @Auth()
  @AuditActionDecorator(AuditAction.UPDATE, EntityType.PERMISSION, { captureSnapshot: true })
  @ApiOperation({ summary: 'Update a permission' })
  @ApiParam({ name: 'id', type: 'string', description: 'Permission MongoDB ObjectId' })
  @ApiBody({ type: UpdatePermissionDto })
  @ApiResponse({ status: 200, description: 'Permission updated successfully', type: PermissionResponseDto })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
    return ApiRes.success(permission, this.i18n.translate('permissions.updated'));
  }

  @Auth()
  @AuditActionDecorator(AuditAction.DELETE, EntityType.PERMISSION)
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiParam({ name: 'id', type: 'string', description: 'Permission MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Delete(':id')
  async remove(@Param() findOneDto: FindOneDto, @CurrentUser() currentUser: CurrentUserPayload) {
    await this.permissionsService.remove(findOneDto.id);
    this.permissionsGateway.notifyPermissionDeleted(findOneDto.id, currentUser.username);
    return ApiRes.success(null, this.i18n.translate('permissions.deleted'));
  }
}
