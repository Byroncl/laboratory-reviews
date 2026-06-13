import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiResponse } from '../../core/dto/api.response';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.rolesService.create(createRoleDto);
    return ApiResponse.success(role, 'Role created successfully');
  }

  @Get()
  async findAll() {
    const roles = await this.rolesService.findAll();
    return ApiResponse.success(roles);
  }

  @Get(':id')
  async findOne(@Param() findOneDto: FindOneDto) {
    const role = await this.rolesService.findOne(findOneDto.id);
    return ApiResponse.success(role);
  }

  @Put(':id')
  async update(
    @Param() findOneDto: FindOneDto,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const role = await this.rolesService.update(findOneDto.id, updateRoleDto);
    return ApiResponse.success(role, 'Role updated successfully');
  }

  @Delete(':id')
  async remove(@Param() findOneDto: FindOneDto) {
    await this.rolesService.remove(findOneDto.id);
    return ApiResponse.success(null, 'Role deleted successfully');
  }
}
