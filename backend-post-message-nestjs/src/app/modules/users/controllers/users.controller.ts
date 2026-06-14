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
import {
  USERS_SWAGGER,
  USERS_RESPONSE_DESCRIPTIONS,
  USERS_PARAM_DESCRIPTIONS,
  USERS_MESSAGES,
} from '../constants/users.constants';

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
  @ApiOperation(USERS_SWAGGER.CREATE)
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: USERS_RESPONSE_DESCRIPTIONS.CREATED,
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: USERS_RESPONSE_DESCRIPTIONS.VALIDATION_FAILED,
  })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    this.usersGateway.notifyUserCreated(user, 'System');
    return ApiRes.success(user, this.i18n.translate(USERS_MESSAGES.CREATED));
  }

  @Auth()
  @ApiOperation(USERS_SWAGGER.FIND_ALL)
  @ApiResponse({
    status: 200,
    description: USERS_RESPONSE_DESCRIPTIONS.LIST,
  })
  @ApiResponse({
    status: 401,
    description: USERS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
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
  @ApiOperation(USERS_SWAGGER.FIND_ONE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: USERS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiResponse({
    status: 200,
    description: USERS_RESPONSE_DESCRIPTIONS.FOUND,
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: USERS_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @ApiResponse({
    status: 401,
    description: USERS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Get(':id')
  async findOne(@Param() findOneDto: FindOneDto) {
    const user = await this.usersService.findOne(findOneDto.id);
    return ApiRes.success(user);
  }

  @Auth()
  @AuditActionDecorator(AuditAction.UPDATE, EntityType.USER, { captureSnapshot: true })
  @ApiOperation(USERS_SWAGGER.UPDATE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: USERS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: USERS_RESPONSE_DESCRIPTIONS.UPDATED,
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: USERS_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @ApiResponse({
    status: 401,
    description: USERS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Put(':id')
  async update(
    @Param() findOneDto: FindOneDto,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    const user = await this.usersService.update(findOneDto.id, updateUserDto);
    this.usersGateway.notifyUserUpdated(user, currentUser.username);
    return ApiRes.success(user, this.i18n.translate(USERS_MESSAGES.UPDATED));
  }

  @Auth()
  @AuditActionDecorator(AuditAction.DELETE, EntityType.USER)
  @ApiOperation(USERS_SWAGGER.DELETE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: USERS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiResponse({
    status: 200,
    description: USERS_RESPONSE_DESCRIPTIONS.DELETED,
  })
  @ApiResponse({
    status: 404,
    description: USERS_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @ApiResponse({
    status: 401,
    description: USERS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Delete(':id')
  async remove(
    @Param() findOneDto: FindOneDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    await this.usersService.remove(findOneDto.id);
    this.usersGateway.notifyUserDeleted(findOneDto.id, currentUser.username);
    return ApiRes.success(null, this.i18n.translate(USERS_MESSAGES.DELETED));
  }

  @Auth()
  @AuditActionDecorator(AuditAction.ASSIGN, EntityType.USER)
  @ApiOperation(USERS_SWAGGER.ASSIGN_ROLE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: USERS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiBody({ type: AssignRoleDto })
  @ApiResponse({
    status: 200,
    description: USERS_RESPONSE_DESCRIPTIONS.ROLE_ASSIGNED,
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: USERS_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @ApiResponse({
    status: 401,
    description: USERS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Post(':id/role')
  async assignRole(
    @Param() findOneDto: FindOneDto,
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    const user = await this.usersService.assignRole(findOneDto.id, assignRoleDto.roleId);
    return ApiRes.success(user, this.i18n.translate(USERS_MESSAGES.ROLE_ASSIGNED));
  }

  @Auth()
  @ApiOperation(USERS_SWAGGER.SET_LANGUAGE)
  @ApiParam({
    name: 'language',
    enum: ['en', 'es'],
    description: 'Preferred language (en or es)',
  })
  @ApiResponse({
    status: 200,
    description: USERS_RESPONSE_DESCRIPTIONS.LANGUAGE_UPDATED,
  })
  @ApiResponse({
    status: 400,
    description: USERS_RESPONSE_DESCRIPTIONS.VALIDATION_FAILED,
  })
  @ApiResponse({
    status: 401,
    description: USERS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Put('language/:language')
  async setLanguage(
    @Param('language') language: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (language !== 'en' && language !== 'es') {
      throw new BadRequestException(
        this.i18n.translate(USERS_MESSAGES.LANGUAGE_INVALID),
      );
    }

    const updated = await this.usersService.updateLanguagePreference(
      user.userId,
      language as 'en' | 'es',
    );
    return ApiRes.success(
      updated,
      this.i18n.translate(USERS_MESSAGES.LANGUAGE_UPDATED),
    );
  }

  @Auth()
  @ApiOperation(USERS_SWAGGER.GET_PROFILE)
  @ApiResponse({
    status: 200,
    description: USERS_RESPONSE_DESCRIPTIONS.FOUND,
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: USERS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Get('me/profile')
  async getProfile(@CurrentUser() currentUser: CurrentUserPayload) {
    const user = await this.usersService.findOne(currentUser.userId);
    return ApiRes.success(user);
  }

  @Auth()
  @ApiOperation(USERS_SWAGGER.CHANGE_PASSWORD)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: USERS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: USERS_RESPONSE_DESCRIPTIONS.PASSWORD_CHANGED,
  })
  @ApiResponse({
    status: 400,
    description: USERS_RESPONSE_DESCRIPTIONS.VALIDATION_FAILED,
  })
  @ApiResponse({
    status: 401,
    description: USERS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Put(':id/password')
  async changePassword(
    @Param() findOneDto: FindOneDto,
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    if (findOneDto.id !== currentUser.userId) {
      throw new BadRequestException(this.i18n.translate('common.forbidden'));
    }
    await this.usersService.changePassword(findOneDto.id, changePasswordDto);
    return ApiRes.success(null, this.i18n.translate(USERS_MESSAGES.PASSWORD_CHANGED));
  }

  @Auth()
  @UseGuards(PermissionsGuard)
  @HasPermission('users:manage')
  @AuditActionDecorator(AuditAction.ACTIVATE, EntityType.USER)
  @ApiOperation(USERS_SWAGGER.ACTIVATE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: USERS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiResponse({
    status: 200,
    description: USERS_RESPONSE_DESCRIPTIONS.ACTIVATED,
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: USERS_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @ApiResponse({
    status: 401,
    description: USERS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Put(':id/activate')
  async activate(
    @Param() findOneDto: FindOneDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    const user = await this.usersService.activate(findOneDto.id);
    this.usersGateway.notifyUserActivated(user, currentUser.username);
    return ApiRes.success(user, this.i18n.translate(USERS_MESSAGES.ACTIVATED));
  }

  @Auth()
  @UseGuards(PermissionsGuard)
  @HasPermission('users:manage')
  @AuditActionDecorator(AuditAction.DEACTIVATE, EntityType.USER)
  @ApiOperation(USERS_SWAGGER.DEACTIVATE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: USERS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiResponse({
    status: 200,
    description: USERS_RESPONSE_DESCRIPTIONS.DEACTIVATED,
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: USERS_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @ApiResponse({
    status: 401,
    description: USERS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Put(':id/deactivate')
  async deactivate(
    @Param() findOneDto: FindOneDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    const user = await this.usersService.deactivate(findOneDto.id);
    this.usersGateway.notifyUserDeactivated(user, currentUser.username);
    return ApiRes.success(user, this.i18n.translate(USERS_MESSAGES.DEACTIVATED));
  }

  @Auth()
  @UseGuards(PermissionsGuard)
  @HasPermission('users:manage')
  @ApiOperation(USERS_SWAGGER.GET_STATS)
  @ApiResponse({
    status: 200,
    description: USERS_RESPONSE_DESCRIPTIONS.LIST,
  })
  @ApiResponse({
    status: 401,
    description: USERS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Get('stats/overview')
  async getStats() {
    const stats = await this.usersService.getStats();
    return ApiRes.success(stats);
  }
}
