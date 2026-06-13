import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  BadRequestException,
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
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { ApiResponse as ApiRes } from '../../../core/dto/api.response';
import { Auth } from '../../../core/decorators/auth.decorator';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';
import { I18nService } from '../../../core/i18n/i18n.service';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../core/decorators/current-user.decorator';

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
    private readonly i18n: I18nService,
  ) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return ApiRes.success(user, this.i18n.translate('users.created'));
  }

  @Auth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users', type: [UserResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return ApiRes.success(users);
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
  ) {
    const user = await this.usersService.update(findOneDto.id, updateUserDto);
    return ApiRes.success(user, this.i18n.translate('users.updated'));
  }

  @Auth()
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', type: 'string', description: 'User MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Delete(':id')
  async remove(@Param() findOneDto: FindOneDto) {
    await this.usersService.remove(findOneDto.id);
    return ApiRes.success(null, this.i18n.translate('users.deleted'));
  }

  @Auth()
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
}
