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
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse as ApiResDecorator,
  ApiHeader,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { FavoritesService } from '../services/favorites.service';
import { CreateFavoriteDto } from '../dto/create-favorite.dto';
import { FavoriteResponseDto } from '../dto/favorite-response.dto';
import { ApiResponse } from '../../../core/dto/api.response';
import { I18nService } from '../../../core/i18n/i18n.service';
import { FindOneDto } from '../../../core/dto/find-one.dto';
import { PaginationQueryDto } from '../../../core/dto/pagination.dto';
import {
  FAVORITES_SWAGGER,
  FAVORITES_RESPONSE_DESCRIPTIONS,
  FAVORITES_PARAM_DESCRIPTIONS,
  FAVORITES_MESSAGES,
} from '../constants/favorites.constants';

@ApiTags('favorites')
@ApiHeader({
  name: 'Accept-Language',
  description: 'Language preference: en (English) or es (Spanish)',
  required: false,
  example: 'es',
})
@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(
    private readonly favoritesService: FavoritesService,
    private readonly i18n: I18nService,
  ) {}

  private validateIsClientOrAdmin(user: any): void {
    const isClient = user.type === 'client';
    const isAdmin = user.role === 'admin' || (typeof user.role === 'object' && user.role?.name === 'admin');

    if (!isClient && !isAdmin) {
      throw new ForbiddenException(this.i18n.translate('common.forbidden'));
    }
  }

  @ApiOperation(FAVORITES_SWAGGER.ADD)
  @ApiBody({ type: CreateFavoriteDto })
  @ApiResDecorator({
    status: 201,
    description: FAVORITES_RESPONSE_DESCRIPTIONS.ADDED,
    type: FavoriteResponseDto,
  })
  @ApiResDecorator({
    status: 400,
    description: FAVORITES_RESPONSE_DESCRIPTIONS.VALIDATION_FAILED,
  })
  @ApiResDecorator({
    status: 401,
    description: FAVORITES_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addFavorite(@CurrentUser() user: any, @Body() createFavoriteDto: CreateFavoriteDto) {
    this.validateIsClientOrAdmin(user);
    const favorite = await this.favoritesService.addFavorite(user.id, createFavoriteDto);
    return ApiResponse.success(favorite, this.i18n.translate(FAVORITES_MESSAGES.ADDED));
  }

  @ApiOperation(FAVORITES_SWAGGER.REMOVE)
  @ApiParam({
    name: 'postId',
    type: 'string',
    description: FAVORITES_PARAM_DESCRIPTIONS.POST_ID,
  })
  @ApiResDecorator({
    status: 200,
    description: FAVORITES_RESPONSE_DESCRIPTIONS.REMOVED,
  })
  @ApiResDecorator({
    status: 401,
    description: FAVORITES_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Delete(':postId')
  @HttpCode(HttpStatus.OK)
  async removeFavorite(@CurrentUser() user: any, @Param('postId') postId: string) {
    this.validateIsClientOrAdmin(user);
    await this.favoritesService.removeFavorite(user.id, postId);
    return ApiResponse.success(null, this.i18n.translate(FAVORITES_MESSAGES.REMOVED));
  }

  @ApiOperation(FAVORITES_SWAGGER.GET_ALL)
  @ApiResDecorator({
    status: 200,
    description: FAVORITES_RESPONSE_DESCRIPTIONS.LIST,
  })
  @ApiResDecorator({
    status: 401,
    description: FAVORITES_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Get()
  async getMyFavorites(
    @CurrentUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    this.validateIsClientOrAdmin(user);
    const result = await this.favoritesService.getMyFavorites(user.id, page, limit);
    return ApiResponse.success(result);
  }

  @ApiOperation(FAVORITES_SWAGGER.CHECK)
  @ApiParam({
    name: 'postId',
    type: 'string',
    description: FAVORITES_PARAM_DESCRIPTIONS.POST_ID,
  })
  @ApiResDecorator({
    status: 200,
    description: FAVORITES_RESPONSE_DESCRIPTIONS.CHECKED,
  })
  @ApiResDecorator({
    status: 401,
    description: FAVORITES_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Get('check/:postId')
  async checkFavorite(@CurrentUser() user: any, @Param('postId') postId: string) {
    this.validateIsClientOrAdmin(user);
    const isFavorite = await this.favoritesService.isFavorite(user.id, postId);
    return ApiResponse.success({ isFavorite });
  }
}
