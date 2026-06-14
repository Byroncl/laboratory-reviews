import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { FavoritesService } from '../services/favorites.service';
import { CreateFavoriteDto } from '../dto/create-favorite.dto';
import { ApiResponse } from '../../../core/dto/api.response';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  private validateIsClientOrAdmin(user: any): void {
    const isClient = user.type === 'client';
    const isAdmin = user.role === 'admin' || (typeof user.role === 'object' && user.role?.name === 'admin');

    if (!isClient && !isAdmin) {
      throw new ForbiddenException('Acceso denegado');
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addFavorite(@CurrentUser() user: any, @Body() createFavoriteDto: CreateFavoriteDto) {
    this.validateIsClientOrAdmin(user);
    const favorite = await this.favoritesService.addFavorite(user.id, createFavoriteDto);
    return ApiResponse.success(favorite, 'Post added to favorites');
  }

  @Delete(':postId')
  @HttpCode(HttpStatus.OK)
  async removeFavorite(@CurrentUser() user: any, @Param('postId') postId: string) {
    this.validateIsClientOrAdmin(user);
    await this.favoritesService.removeFavorite(user.id, postId);
    return ApiResponse.success(null, 'Post removed from favorites');
  }

  @Get()
  async getMyFavorites(
    @CurrentUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    this.validateIsClientOrAdmin(user);
    const result = await this.favoritesService.getMyFavorites(user.id, page, limit);
    return ApiResponse.success(result, 'Favorites retrieved successfully');
  }

  @Get('check/:postId')
  async checkFavorite(@CurrentUser() user: any, @Param('postId') postId: string) {
    this.validateIsClientOrAdmin(user);
    const isFavorite = await this.favoritesService.isFavorite(user.id, postId);
    return ApiResponse.success({ isFavorite }, 'Check complete');
  }
}
