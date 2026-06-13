import { Controller, Get, Post, Body } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }
}
