import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { RolesService } from '../services/roles.service';
import { RolesGateway } from '../gateways/roles.gateway';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { AssignPermissionsDto } from '../dto/assign-permissions.dto';
import { RoleResponseDto } from '../dto/role-response.dto';
import { ApiResponse as ApiRes } from '../../../core/dto/api.response';
import { Auth } from '../../../core/decorators/auth.decorator';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';
import { I18nService } from '../../../core/i18n/i18n.service';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../core/decorators/current-user.decorator';
import { AuditActionDecorator } from '../../../core/decorators/audit-action.decorator';
import { AuditAction, EntityType } from '../../audit/schemas/audit-log.schema';
import {
  ROLES_SWAGGER,
  ROLES_RESPONSE_DESCRIPTIONS,
  ROLES_PARAM_DESCRIPTIONS,
  ROLES_MESSAGES,
} from '../constants/roles.constants';

@ApiTags('roles')
@ApiHeader({
  name: 'Accept-Language',
  description: 'Language preference: en (English) or es (Spanish)',
  required: false,
  example: 'es',
})
@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly rolesGateway: RolesGateway,
    private readonly i18n: I18nService,
  ) {}

  @Auth()
  @AuditActionDecorator(AuditAction.CREATE, EntityType.ROLE)
  @ApiOperation(ROLES_SWAGGER.CREATE)
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({
    status: 201,
    description: ROLES_RESPONSE_DESCRIPTIONS.CREATED,
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: ROLES_RESPONSE_DESCRIPTIONS.VALIDATION_FAILED,
  })
  @ApiResponse({
    status: 401,
    description: ROLES_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Post()
  async create(@Body() createRoleDto: CreateRoleDto, @CurrentUser() currentUser: CurrentUserPayload) {
    const role = await this.rolesService.create(createRoleDto);
    this.rolesGateway.notifyRoleCreated(role, currentUser.username);
    return ApiRes.success(role, this.i18n.translate(ROLES_MESSAGES.CREATED));
  }

  @Auth()
  @ApiOperation(ROLES_SWAGGER.FIND_ALL)
  @ApiResponse({
    status: 200,
    description: ROLES_RESPONSE_DESCRIPTIONS.LIST,
    type: [RoleResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: ROLES_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Get()
  async findAll(@Query('name') name?: string) {
    const roles = await this.rolesService.findAll(name);
    return ApiRes.success(roles);
  }

  @Auth()
  @ApiOperation(ROLES_SWAGGER.FIND_ONE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: ROLES_PARAM_DESCRIPTIONS.ID,
  })
  @ApiResponse({
    status: 200,
    description: ROLES_RESPONSE_DESCRIPTIONS.FOUND,
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: ROLES_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @ApiResponse({
    status: 401,
    description: ROLES_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Get(':id')
  async findOne(@Param() findOneDto: FindOneDto) {
    const role = await this.rolesService.findOne(findOneDto.id);
    return ApiRes.success(role);
  }

  @Auth()
  @AuditActionDecorator(AuditAction.UPDATE, EntityType.ROLE, { captureSnapshot: true })
  @ApiOperation(ROLES_SWAGGER.UPDATE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: ROLES_PARAM_DESCRIPTIONS.ID,
  })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({
    status: 200,
    description: ROLES_RESPONSE_DESCRIPTIONS.UPDATED,
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: ROLES_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @ApiResponse({
    status: 401,
    description: ROLES_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Put(':id')
  async update(
    @Param() findOneDto: FindOneDto,
    @Body() updateRoleDto: UpdateRoleDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    const role = await this.rolesService.update(findOneDto.id, updateRoleDto);
    this.rolesGateway.notifyRoleUpdated(role, currentUser.username);
    return ApiRes.success(role, this.i18n.translate(ROLES_MESSAGES.UPDATED));
  }

  @Auth()
  @AuditActionDecorator(AuditAction.ASSIGN, EntityType.ROLE)
  @ApiOperation(ROLES_SWAGGER.ASSIGN_PERMISSIONS)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: ROLES_PARAM_DESCRIPTIONS.ID,
  })
  @ApiBody({ type: AssignPermissionsDto })
  @ApiResponse({
    status: 200,
    description: ROLES_RESPONSE_DESCRIPTIONS.PERMISSIONS_ASSIGNED,
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: ROLES_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @ApiResponse({
    status: 401,
    description: ROLES_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Post(':id/permissions')
  async assignPermissions(
    @Param() findOneDto: FindOneDto,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    const role = await this.rolesService.assignPermissions(
      findOneDto.id,
      assignPermissionsDto.permissionIds,
    );
    return ApiRes.success(role, this.i18n.translate(ROLES_MESSAGES.PERMISSIONS_ASSIGNED));
  }

  @Auth()
  @AuditActionDecorator(AuditAction.DELETE, EntityType.ROLE)
  @ApiOperation(ROLES_SWAGGER.DELETE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: ROLES_PARAM_DESCRIPTIONS.ID,
  })
  @ApiResponse({
    status: 200,
    description: ROLES_RESPONSE_DESCRIPTIONS.DELETED,
  })
  @ApiResponse({
    status: 404,
    description: ROLES_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @ApiResponse({
    status: 401,
    description: ROLES_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Delete(':id')
  async remove(@Param() findOneDto: FindOneDto, @CurrentUser() currentUser: CurrentUserPayload) {
    await this.rolesService.remove(findOneDto.id);
    this.rolesGateway.notifyRoleDeleted(findOneDto.id, currentUser.username);
    return ApiRes.success(null, this.i18n.translate(ROLES_MESSAGES.DELETED));
  }
}
