import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UsersGateway } from '../gateways/users.gateway';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { ApiResponse as ApiRes } from '../../../core/dto/api.response';
import { Auth } from '../../../core/decorators/auth.decorator';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';
import { PaginationQueryDto } from '../../../core/dto/pagination.dto';
import { I18nService } from '../../../core/i18n/i18n.service';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../core/decorators/current-user.decorator';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { PermissionsGuard } from '../../../core/guards/permissions.guard';
import { HasPermission } from '../../../core/decorators/has-permission.decorator';
import { AuditActionDecorator } from '../../../core/decorators/audit-action.decorator';
import { AuditAction, EntityType } from '../../audit/schemas/audit-log.schema';

@ApiTags('users')
@ApiHeader({
  name: 'Accept-Language',
  description: 'Language preference: en (English) or es (Spanish)',
  required: false,
  example: 'es',
})
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersGateway: UsersGateway,
    private readonly i18n: I18nService,
  ) {}

  @AuditActionDecorator(AuditAction.CREATE, EntityType.USER)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    this.usersGateway.notifyUserCreated(user, 'System');
    return ApiRes.success(user, this.i18n.translate('users.created'));
  }

  @Auth()
  @ApiOperation({ summary: 'Get all users (paginated with filters)' })
  @ApiResponse({ status: 200, description: 'Paginated list of users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  async findAll(
    @Query() paginationDto: PaginationQueryDto,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('email') email?: string
  ) {
    const result = await this.usersService.findAllPaginated(
      paginationDto.skip,
      paginationDto.limit,
      { role, status, email }
    );
    return ApiRes.success(result);
  }

  @Auth()
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'User MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get(':id')
  async findOne(@Param() findOneDto: FindOneDto) {
    const user = await this.usersService.findOne(findOneDto.id);
    return ApiRes.success(user);
  }

  @Auth()
  @AuditActionDecorator(AuditAction.UPDATE, EntityType.USER, { captureSnapshot: true })
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', type: 'string', description: 'User MongoDB ObjectId' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put(':id')
  async update(
    @Param() findOneDto: FindOneDto,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    const user = await this.usersService.update(findOneDto.id, updateUserDto);
    this.usersGateway.notifyUserUpdated(user, currentUser.username);
    return ApiRes.success(user, this.i18n.translate('users.updated'));
  }

  @Auth()
  @AuditActionDecorator(AuditAction.DELETE, EntityType.USER)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', type: 'string', description: 'User MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Delete(':id')
  async remove(
    @Param() findOneDto: FindOneDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    await this.usersService.remove(findOneDto.id);
    this.usersGateway.notifyUserDeleted(findOneDto.id, currentUser.username);
    return ApiRes.success(null, this.i18n.translate('users.deleted'));
  }

  @Auth()
  @AuditActionDecorator(AuditAction.ASSIGN, EntityType.USER)
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiParam({ name: 'id', type: 'string', description: 'User MongoDB ObjectId' })
  @ApiBody({ type: AssignRoleDto })
  @ApiResponse({ status: 200, description: 'Role assigned successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post(':id/role')
  async assignRole(
    @Param() findOneDto: FindOneDto,
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    const user = await this.usersService.assignRole(findOneDto.id, assignRoleDto.roleId);
    return ApiRes.success(user, this.i18n.translate('users.role_assigned'));
  }

  @Auth()
  @ApiOperation({ summary: 'Set language preference for authenticated user' })
  @ApiParam({ name: 'language', enum: ['en', 'es'], description: 'Preferred language' })
  @ApiResponse({ status: 200, description: 'Language preference updated' })
  @ApiResponse({ status: 400, description: 'Invalid language' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put('language/:language')
  async setLanguage(
    @Param('language') language: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (language !== 'en' && language !== 'es') {
      throw new BadRequestException(
        this.i18n.translate('users.language_invalid'),
      );
    }

    const updated = await this.usersService.updateLanguagePreference(
      user.userId,
      language as 'en' | 'es',
    );
    return ApiRes.success(
      updated,
      this.i18n.translate('users.language_updated'),
    );
  }

  @Auth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('me/profile')
  async getProfile(@CurrentUser() currentUser: CurrentUserPayload) {
    const user = await this.usersService.findOne(currentUser.userId);
    return ApiRes.success(user);
  }

  @Auth()
  @ApiOperation({ summary: 'Change password for a user' })
  @ApiParam({ name: 'id', type: 'string', description: 'User MongoDB ObjectId' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Passwords do not match or current password is invalid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put(':id/password')
  async changePassword(
    @Param() findOneDto: FindOneDto,
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    if (findOneDto.id !== currentUser.userId) {
      throw new BadRequestException('Cannot change another user password');
    }
    await this.usersService.changePassword(findOneDto.id, changePasswordDto);
    return ApiRes.success(null, this.i18n.translate('users.password_changed'));
  }

  @Auth()
  @UseGuards(PermissionsGuard)
  @HasPermission('users:manage')
  @AuditActionDecorator(AuditAction.ACTIVATE, EntityType.USER)
  @ApiOperation({ summary: 'Activate a user (admin only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'User MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'User activated', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put(':id/activate')
  async activate(
    @Param() findOneDto: FindOneDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    const user = await this.usersService.activate(findOneDto.id);
    this.usersGateway.notifyUserActivated(user, currentUser.username);
    return ApiRes.success(user, this.i18n.translate('users.activated'));
  }

  @Auth()
  @UseGuards(PermissionsGuard)
  @HasPermission('users:manage')
  @AuditActionDecorator(AuditAction.DEACTIVATE, EntityType.USER)
  @ApiOperation({ summary: 'Deactivate a user (admin only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'User MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'User deactivated', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put(':id/deactivate')
  async deactivate(
    @Param() findOneDto: FindOneDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    const user = await this.usersService.deactivate(findOneDto.id);
    this.usersGateway.notifyUserDeactivated(user, currentUser.username);
    return ApiRes.success(user, this.i18n.translate('users.deactivated'));
  }

  @Auth()
  @UseGuards(PermissionsGuard)
  @HasPermission('users:manage')
  @ApiOperation({ summary: 'Get user statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'User statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('stats/overview')
  async getStats() {
    const stats = await this.usersService.getStats();
    return ApiRes.success(stats);
  }
}
