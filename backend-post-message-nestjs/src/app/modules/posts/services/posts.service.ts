import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { FilesService } from '../../files/services/files.service';
import { CategoriesService } from '../../categories/services/categories.service';
import { PaginatedResponse } from 'src/app/core/dto/pagination.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private readonly filesService: FilesService,
    @Optional() private readonly categoriesService?: CategoriesService,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const createdPost = new this.postModel(createPostDto);
    const saved = await createdPost.save();

    if (createPostDto.categoryId && this.categoriesService) {
      await this.categoriesService.incrementPostsCount(createPostDto.categoryId);
    }

    return saved;
  }

  async findAll(categoryId?: string): Promise<Post[]> {
    const filter = categoryId ? { categoryId } : {};
    return this.postModel.find(filter).exec();
  }

  async findAllPaginated(
    skip: number,
    limit: number,
    filters?: { categoryId?: string; status?: string; author?: string }
  ): Promise<PaginatedResponse<Post>> {
    const filter: Record<string, unknown> = {};

    if (filters?.categoryId) {
      filter.categoryId = filters.categoryId;
    }
    if (filters?.status) {
      filter.status = filters.status;
    }
    if (filters?.author) {
      filter.author = { $regex: filters.author, $options: 'i' };
    }

    const [items, total] = await Promise.all([
      this.postModel.find(filter).skip(skip).limit(limit).exec(),
      this.postModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      skip,
      limit,
    };
  }

  async findOne(id: string): Promise<Post | null> {
    return this.postModel.findById(id).exec();
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post | null> {
    const existing = await this.postModel.findById(id).exec();

    if (
      existing?.imageFilename &&
      updatePostDto.imageFilename &&
      existing.imageFilename !== updatePostDto.imageFilename
    ) {
      await this.filesService.deleteImage(existing.imageFilename);
    }

    return this.postModel
      .findByIdAndUpdate(id, updatePostDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Post | null> {
    const post = await this.postModel.findByIdAndDelete(id).exec();

    if (post?.imageFilename) {
      await this.filesService.deleteImage(post.imageFilename);
    }

    if (post?.categoryId && this.categoriesService) {
      await this.categoriesService.decrementPostsCount(post.categoryId);
    }

    return post;
  }

  async bulkCreate(createPostDtos: CreatePostDto[]): Promise<any> {
    return this.postModel.insertMany(createPostDtos);
  }
}
