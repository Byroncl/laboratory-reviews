import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiResponse } from '../../core/dto/api.response';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return ApiResponse.success(user, 'User created successfully');
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return ApiResponse.success(users);
  }
}
