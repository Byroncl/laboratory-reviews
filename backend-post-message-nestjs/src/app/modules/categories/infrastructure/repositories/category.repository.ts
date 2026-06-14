import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../../schemas/category.schema';
import {
  ICategoryRepository,
  ICategory,
} from '../../interfaces/category.interface';
import { CategoryEntity } from '../../domain/entities/category.entity';
import { CategoryMapper } from './category.mapper';
import { CATEGORY_MESSAGES } from '../../constants/category.constants';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private mapper: CategoryMapper,
  ) {}

  async create(category: ICategory): Promise<ICategory> {
    const existingByName = await this.categoryModel
      .findOne({ name: category.name })
      .exec();
    if (existingByName) {
      throw new BadRequestException(CATEGORY_MESSAGES.NAME_ALREADY_EXISTS);
    }

    const existingBySlug = await this.categoryModel
      .findOne({ slug: category.slug })
      .exec();
    if (existingBySlug) {
      throw new BadRequestException(CATEGORY_MESSAGES.SLUG_ALREADY_EXISTS);
    }

    const entity = new CategoryEntity(category);
    const created = await this.categoryModel.create(
      this.mapper.toPersistence(entity),
    );
    return this.mapper.toResponse(this.mapper.toDomain(created));
  }

  async findById(id: string): Promise<ICategory | null> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) return null;
    return this.mapper.toResponse(this.mapper.toDomain(category));
  }

  async findBySlug(slug: string): Promise<ICategory | null> {
    const category = await this.categoryModel.findOne({ slug }).exec();
    if (!category) return null;
    return this.mapper.toResponse(this.mapper.toDomain(category));
  }

  async findAll(
    skip: number,
    limit: number,
    filters?: any,
  ): Promise<{ items: ICategory[]; total: number }> {
    const filter = this.buildFilter(filters);

    const [items, total] = await Promise.all([
      this.categoryModel
        .find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.categoryModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((item) =>
        this.mapper.toResponse(this.mapper.toDomain(item)),
      ),
      total,
    };
  }

  async findActive(): Promise<ICategory[]> {
    const categories = await this.categoryModel
      .find({ isActive: true })
      .sort({ name: 1 })
      .exec();
    return categories.map((cat) =>
      this.mapper.toResponse(this.mapper.toDomain(cat)),
    );
  }

  async update(
    id: string,
    category: Partial<ICategory>,
  ): Promise<ICategory | null> {
    const existing = await this.categoryModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException(CATEGORY_MESSAGES.NOT_FOUND);
    }

    if (category.name && category.name !== existing.name) {
      const dup = await this.categoryModel
        .findOne({ name: category.name })
        .exec();
      if (dup) {
        throw new BadRequestException(CATEGORY_MESSAGES.NAME_ALREADY_EXISTS);
      }
    }

    if (category.slug && category.slug !== existing.slug) {
      const dup = await this.categoryModel
        .findOne({ slug: category.slug })
        .exec();
      if (dup) {
        throw new BadRequestException(CATEGORY_MESSAGES.SLUG_ALREADY_EXISTS);
      }
    }

    const entity = this.mapper.toDomain(existing);
    const updated = entity.update(category);
    const result = await this.categoryModel.findByIdAndUpdate(
      id,
      this.mapper.toPersistence(updated),
      {
        new: true,
      },
    );

    return result ? this.mapper.toResponse(this.mapper.toDomain(result)) : null;
  }

  async delete(id: string): Promise<void> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(CATEGORY_MESSAGES.NOT_FOUND);
    }

    const entity = this.mapper.toDomain(category);
    if (!entity.canDelete()) {
      throw new BadRequestException(CATEGORY_MESSAGES.CANNOT_DELETE_WITH_POSTS);
    }

    await this.categoryModel.findByIdAndDelete(id).exec();
  }

  async bulkCreate(categories: ICategory[]): Promise<ICategory[]> {
    const slugs = categories.map((c) => c.slug);
    const duplicates = await this.categoryModel
      .find({ slug: { $in: slugs } })
      .exec();

    if (duplicates.length > 0) {
      const duplicateSlugs = duplicates.map((d) => d.slug).join(', ');
      throw new BadRequestException(
        `Las siguientes categorías ya existen: ${duplicateSlugs}`,
      );
    }

    const entities = categories.map((c) => new CategoryEntity(c));
    const created = await this.categoryModel.insertMany(
      entities.map((e) => this.mapper.toPersistence(e)),
    );

    return created.map((item) =>
      this.mapper.toResponse(this.mapper.toDomain(item)),
    );
  }

  async incrementPostsCount(id: string): Promise<void> {
    await this.categoryModel
      .findByIdAndUpdate(id, { $inc: { postsCount: 1 } })
      .exec();
  }

  async decrementPostsCount(id: string): Promise<void> {
    await this.categoryModel
      .updateOne(
        { _id: id, postsCount: { $gt: 0 } },
        { $inc: { postsCount: -1 } },
      )
      .exec();
  }

  private buildFilter(filters?: any): Record<string, any> {
    const filter: Record<string, any> = {};

    if (filters?.isActive !== undefined) {
      filter.isActive = filters.isActive;
    } else {
      filter.isActive = true;
    }

    if (filters?.search) {
      filter.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { slug: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return filter;
  }
}
