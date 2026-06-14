import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const slug =
      createCategoryDto.slug || this.generateSlug(createCategoryDto.name);

    const existing = await this.categoryModel.findOne({ slug }).exec();
    if (existing) {
      throw new ConflictException('Category with this slug already exists');
    }

    const category = new this.categoryModel({
      ...createCategoryDto,
      slug,
    });
    return category.save();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ slug }).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Category not found');
    }
  }

  async incrementPostsCount(categoryId: string): Promise<void> {
    await this.categoryModel
      .findByIdAndUpdate(categoryId, { $inc: { postsCount: 1 } })
      .exec();
  }

  async decrementPostsCount(categoryId: string): Promise<void> {
    await this.categoryModel
      .findByIdAndUpdate(categoryId, { $inc: { postsCount: -1 } })
      .exec();
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}
