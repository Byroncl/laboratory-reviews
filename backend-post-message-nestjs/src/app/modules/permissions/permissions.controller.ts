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
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionResponseDto } from './dto/permission-response.dto';
import { ApiResponse as ApiRes } from '../../core/dto/api.response';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';

@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @ApiOperation({ summary: 'Create a new permission' })
  @ApiBody({ type: CreatePermissionDto })
  @ApiResponse({ status: 201, description: 'Permission created successfully', type: PermissionResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    const permission = await this.permissionsService.create(createPermissionDto);
    return ApiRes.success(permission, 'Permission created successfully');
  }

  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'List of permissions', type: [PermissionResponseDto] })
  @Get()
  async findAll() {
    const permissions = await this.permissionsService.findAll();
    return ApiRes.success(permissions);
  }

  @ApiOperation({ summary: 'Get a permission by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Permission MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Permission found', type: PermissionResponseDto })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @Get(':id')
  async findOne(@Param() findOneDto: FindOneDto) {
    const permission = await this.permissionsService.findOne(findOneDto.id);
    return ApiRes.success(permission);
  }

  @ApiOperation({ summary: 'Update a permission' })
  @ApiParam({ name: 'id', type: 'string', description: 'Permission MongoDB ObjectId' })
  @ApiBody({ type: UpdatePermissionDto })
  @ApiResponse({ status: 200, description: 'Permission updated successfully', type: PermissionResponseDto })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @Put(':id')
  async update(
    @Param() findOneDto: FindOneDto,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    const permission = await this.permissionsService.update(
      findOneDto.id,
      updatePermissionDto,
    );
    return ApiRes.success(permission, 'Permission updated successfully');
  }

  @ApiOperation({ summary: 'Delete a permission' })
  @ApiParam({ name: 'id', type: 'string', description: 'Permission MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @Delete(':id')
  async remove(@Param() findOneDto: FindOneDto) {
    await this.permissionsService.remove(findOneDto.id);
    return ApiRes.success(null, 'Permission deleted successfully');
  }
}
