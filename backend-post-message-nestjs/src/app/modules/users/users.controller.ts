import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  UseGuards,
  Put,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponse } from '../../core/dto/api.response';
import { AuthGuard } from '@nestjs/passport';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return ApiResponse.success(user, 'User created successfully');
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return ApiResponse.success(users);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(
    @Param() findOneDto: FindOneDto,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(findOneDto.id, updateUserDto);
    return ApiResponse.success(user, 'User updated successfully');
  }
}
