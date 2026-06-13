import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ApiResponse } from '../../core/dto/api.response';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    const permission = await this.permissionsService.create(createPermissionDto);
    return ApiResponse.success(permission, 'Permission created successfully');
  }

  @Get()
  async findAll() {
    const permissions = await this.permissionsService.findAll();
    return ApiResponse.success(permissions);
  }

  @Get(':id')
  async findOne(@Param() findOneDto: FindOneDto) {
    const permission = await this.permissionsService.findOne(findOneDto.id);
    return ApiResponse.success(permission);
  }

  @Put(':id')
  async update(
    @Param() findOneDto: FindOneDto,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    const permission = await this.permissionsService.update(
      findOneDto.id,
      updatePermissionDto,
    );
    return ApiResponse.success(permission, 'Permission updated successfully');
  }

  @Delete(':id')
  async remove(@Param() findOneDto: FindOneDto) {
    await this.permissionsService.remove(findOneDto.id);
    return ApiResponse.success(null, 'Permission deleted successfully');
  }
}
