import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Auth } from '../../../core/decorators/auth.decorator';
import { HasPermission } from '../../../core/decorators/has-permission.decorator';
import { FindOneDto } from '../../../core/dto/find-one.dto';
import { PaginationQueryDto } from '../../../core/dto/pagination.dto';
import { ApiResponse as ApiRes } from '../../../core/dto/api.response';
import { CategoryUseCaseFactory } from '../application/use-cases/category.use-cases';
import { CreateCategoryDto } from '../application/dtos/create-category.dto';
import { UpdateCategoryDto } from '../application/dtos/update-category.dto';
import {
  CategoryResponseDto,
  CategoriesListResponseDto,
} from '../application/dtos/category-response.dto';
import {
  CATEGORY_SWAGGER,
  CATEGORY_MESSAGES,
  CATEGORY_PAGINATION,
} from '../constants/category.constants';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesUseCase: CategoryUseCaseFactory) {}

  @Get()
  @ApiOperation({ summary: CATEGORY_SWAGGER.GET_ALL.SUMMARY, description: CATEGORY_SWAGGER.GET_ALL.DESCRIPTION })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name or slug',
  })
  @ApiResponse({
    status: 200,
    description: CATEGORY_SWAGGER.GET_ALL.DESCRIPTION,
    type: CategoriesListResponseDto,
  })
  async findAll(
    @Query() paginationDto: PaginationQueryDto,
    @Query('search') search?: string,
  ) {
    const page = CATEGORY_PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(
      paginationDto.limit || CATEGORY_PAGINATION.DEFAULT_LIMIT,
      CATEGORY_PAGINATION.MAX_LIMIT,
    );

    const result = await this.categoriesUseCase.getAllCategories(page, limit, {
      search,
    });
    return ApiRes.success(result);
  }

  @Get('active')
  @ApiOperation({
    summary: 'Obtener categorías activas',
    description: 'Retorna todas las categorías activas sin paginación',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías activas',
    type: [CategoryResponseDto],
  })
  async findActive() {
    const categories = await this.categoriesUseCase.getActiveCategories();
    return ApiRes.success(categories);
  }

  @Get(':id')
  @ApiOperation({ summary: CATEGORY_SWAGGER.GET_ONE.SUMMARY, description: CATEGORY_SWAGGER.GET_ONE.DESCRIPTION })
  @ApiParam({ name: 'id', type: String, description: 'ID de la categoría' })
  @ApiResponse({
    status: 200,
    description: CATEGORY_SWAGGER.GET_ONE.DESCRIPTION,
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: CATEGORY_MESSAGES.NOT_FOUND,
  })
  async findOne(@Param() { id }: FindOneDto) {
    const category = await this.categoriesUseCase.getCategoryById(id);
    if (!category) {
      return ApiRes.error(CATEGORY_MESSAGES.NOT_FOUND, undefined, 404);
    }
    return ApiRes.success(category);
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Obtener categoría por slug',
    description: 'Obtiene una categoría usando su slug (URL-friendly)',
  })
  @ApiParam({ name: 'slug', type: String, description: 'Slug de la categoría' })
  @ApiResponse({
    status: 200,
    description: 'Categoría encontrada',
    type: CategoryResponseDto,
  })
  async findBySlug(@Param('slug') slug: string) {
    const category = await this.categoriesUseCase.getCategoryBySlug(slug);
    if (!category) {
      return ApiRes.error(CATEGORY_MESSAGES.NOT_FOUND, undefined, 404);
    }
    return ApiRes.success(category);
  }

  @Post()
  @Auth()
  @HasPermission('manage_categories')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: CATEGORY_SWAGGER.CREATE.SUMMARY, description: CATEGORY_SWAGGER.CREATE.DESCRIPTION })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: CATEGORY_SWAGGER.CREATE.DESCRIPTION,
    type: CategoryResponseDto,
  })
  async create(@Body(ValidationPipe) createCategoryDto: CreateCategoryDto) {
    const category =
      await this.categoriesUseCase.createCategory(createCategoryDto);
    return ApiRes.success(category, CATEGORY_MESSAGES.CREATED);
  }

  @Post('bulk')
  @Auth()
  @HasPermission('manage_categories')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: CATEGORY_SWAGGER.BULK_CREATE.SUMMARY, description: CATEGORY_SWAGGER.BULK_CREATE.DESCRIPTION })
  @ApiBody({ type: [CreateCategoryDto] })
  @ApiResponse({
    status: 201,
    description: CATEGORY_SWAGGER.BULK_CREATE.DESCRIPTION,
    type: [CategoryResponseDto],
  })
  async bulkCreate(
    @Body(ValidationPipe) createCategoryDtos: CreateCategoryDto[],
  ) {
    const categories =
      await this.categoriesUseCase.bulkCreateCategories(createCategoryDtos);
    return ApiRes.success(
      categories,
      `${categories.length} categorías creadas exitosamente`,
    );
  }

  @Put(':id')
  @Auth()
  @HasPermission('manage_categories')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: CATEGORY_SWAGGER.UPDATE.SUMMARY, description: CATEGORY_SWAGGER.UPDATE.DESCRIPTION })
  @ApiParam({ name: 'id', type: String, description: 'ID de la categoría' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: CATEGORY_SWAGGER.UPDATE.DESCRIPTION,
    type: CategoryResponseDto,
  })
  async update(
    @Param() { id }: FindOneDto,
    @Body(ValidationPipe) updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesUseCase.updateCategory(
      id,
      updateCategoryDto,
    );
    if (!category) {
      return ApiRes.error(CATEGORY_MESSAGES.NOT_FOUND, undefined, 404);
    }
    return ApiRes.success(category, CATEGORY_MESSAGES.UPDATED);
  }

  @Delete(':id')
  @Auth()
  @HasPermission('manage_categories')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: CATEGORY_SWAGGER.DELETE.SUMMARY, description: CATEGORY_SWAGGER.DELETE.DESCRIPTION })
  @ApiParam({ name: 'id', type: String, description: 'ID de la categoría' })
  @ApiResponse({
    status: 200,
    description: CATEGORY_SWAGGER.DELETE.DESCRIPTION,
  })
  @ApiResponse({
    status: 404,
    description: CATEGORY_MESSAGES.NOT_FOUND,
  })
  async delete(@Param() { id }: FindOneDto) {
    await this.categoriesUseCase.deleteCategory(id);
    return ApiRes.success(null, CATEGORY_MESSAGES.DELETED);
  }
}
