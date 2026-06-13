import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/create-category.dto';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { ApiResponse as ApiRes } from '../../../core/dto/api.response';
import { Auth } from '../../../core/decorators/auth.decorator';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';
import { TranslationService } from '../../../core/utils/translation.service';
import { AuditActionDecorator } from '../../../core/decorators/audit-action.decorator';
import { AuditAction, EntityType } from '../../audit/schemas/audit-log.schema';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly i18n: TranslationService,
  ) {}

  @AuditActionDecorator(AuditAction.CREATE, EntityType.CATEGORY)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Category created successfully', type: CategoryResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(createCategoryDto);
    return ApiRes.success(category, this.i18n.translate('categories.created'));
  }

  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'List of categories', type: [CategoryResponseDto] })
  @Get()
  async findAll() {
    const categories = await this.categoriesService.findAll();
    return ApiRes.success(categories);
  }

  @ApiOperation({ summary: 'Get category by slug' })
  @ApiParam({ name: 'slug', type: 'string', description: 'Category slug' })
  @ApiResponse({ status: 200, description: 'Category found', type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const category = await this.categoriesService.findBySlug(slug);
    return ApiRes.success(category);
  }

  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Category MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Category found', type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @Get(':id')
  async findOne(@Param() findOneDto: FindOneDto) {
    const category = await this.categoriesService.findOne(findOneDto.id);
    return ApiRes.success(category);
  }

  @Auth()
  @AuditActionDecorator(AuditAction.UPDATE, EntityType.CATEGORY, { captureSnapshot: true })
  @ApiOperation({ summary: 'Update category' })
  @ApiParam({ name: 'id', type: 'string', description: 'Category MongoDB ObjectId' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, description: 'Category updated successfully', type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put(':id')
  async update(
    @Param() findOneDto: FindOneDto,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(
      findOneDto.id,
      updateCategoryDto,
    );
    return ApiRes.success(category, this.i18n.translate('categories.updated'));
  }

  @Auth()
  @AuditActionDecorator(AuditAction.DELETE, EntityType.CATEGORY)
  @ApiOperation({ summary: 'Delete category' })
  @ApiParam({ name: 'id', type: 'string', description: 'Category MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Delete(':id')
  async remove(@Param() findOneDto: FindOneDto) {
    await this.categoriesService.remove(findOneDto.id);
    return ApiRes.success(null, this.i18n.translate('categories.deleted'));
  }
}
