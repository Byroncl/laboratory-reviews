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
} from '@nestjs/swagger';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { AssignPermissionsDto } from '../dto/assign-permissions.dto';
import { RoleResponseDto } from '../dto/role-response.dto';
import { ApiResponse as ApiRes } from '../../../core/dto/api.response';
import { Auth } from '../../../core/decorators/auth.decorator';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';
import { TranslationService } from '../../../core/utils/translation.service';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly i18n: TranslationService,
  ) {}

  @Auth()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 201, description: 'Role created successfully', type: RoleResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.rolesService.create(createRoleDto);
    return ApiRes.success(role, this.i18n.translate('roles.created'));
  }

  @Auth()
  @ApiOperation({ summary: 'Get all roles with optional name filter' })
  @ApiResponse({ status: 200, description: 'List of roles', type: [RoleResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  async findAll(@Query('name') name?: string) {
    const roles = await this.rolesService.findAll(name);
    return ApiRes.success(roles);
  }

  @Auth()
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Role MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Role found', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get(':id')
  async findOne(@Param() findOneDto: FindOneDto) {
    const role = await this.rolesService.findOne(findOneDto.id);
    return ApiRes.success(role);
  }

  @Auth()
  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({ name: 'id', type: 'string', description: 'Role MongoDB ObjectId' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: 200, description: 'Role updated successfully', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put(':id')
  async update(
    @Param() findOneDto: FindOneDto,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const role = await this.rolesService.update(findOneDto.id, updateRoleDto);
    return ApiRes.success(role, this.i18n.translate('roles.updated'));
  }

  @Auth()
  @ApiOperation({ summary: 'Assign permissions to a role' })
  @ApiParam({ name: 'id', type: 'string', description: 'Role MongoDB ObjectId' })
  @ApiBody({ type: AssignPermissionsDto })
  @ApiResponse({ status: 200, description: 'Permissions assigned successfully', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post(':id/permissions')
  async assignPermissions(
    @Param() findOneDto: FindOneDto,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    const role = await this.rolesService.assignPermissions(
      findOneDto.id,
      assignPermissionsDto.permissionIds,
    );
    return ApiRes.success(role, this.i18n.translate('roles.permissions_assigned'));
  }

  @Auth()
  @ApiOperation({ summary: 'Delete a role' })
  @ApiParam({ name: 'id', type: 'string', description: 'Role MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Delete(':id')
  async remove(@Param() findOneDto: FindOneDto) {
    await this.rolesService.remove(findOneDto.id);
    return ApiRes.success(null, this.i18n.translate('roles.deleted'));
  }
}
