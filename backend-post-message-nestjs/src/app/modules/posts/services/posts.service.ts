import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { Comment, CommentDocument } from '../../comments/schemas/comment.schema';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { FilesService } from '../../files/services/files.service';
import { CategoriesService } from '../../categories/services/categories.service';
import { PaginatedResponse } from 'src/app/core/dto/pagination.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private readonly filesService: FilesService,
    @Optional() private readonly categoriesService?: CategoriesService,
  ) {}

  async create(createPostDto: CreatePostDto, authorId?: string): Promise<Post> {
    const postData = {
      ...createPostDto,
      body: createPostDto.body || createPostDto.content,
      ...(authorId && { authorId }),
    };
    const createdPost = new this.postModel(postData);
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
    filters?: {
      categoryId?: string;
      status?: string;
      tags?: string;
      author?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
    },
  ): Promise<PaginatedResponse<Post>> {
    const filter: Record<string, unknown> = {
      isDeleted: false,
      isActive: true,
    };

    if (filters?.categoryId) {
      filter.categoryId = filters.categoryId;
    }
    if (filters?.status) {
      filter.status = filters.status;
    }
    if (filters?.tags) {
      filter.tags = { $in: filters.tags.split(',').map((t) => t.trim()) };
    }
    if (filters?.author) {
      filter.author = { $regex: filters.author, $options: 'i' };
    }
    if (filters?.search) {
      filter.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { body: { $regex: filters.search, $options: 'i' } },
        { author: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const sortBy = filters?.sortBy || 'createdAt';
    const sortOrder = (filters?.sortOrder === 'asc' ? 1 : -1) as 1 | -1;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };

    const [items, total] = await Promise.all([
      this.postModel
        .find(filter)
        .populate('categoryId', 'name slug color')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postModel.countDocuments(filter).exec(),
    ]);

    const itemsWithCommentCount = await Promise.all(
      items.map(async (item) => {
        const commentCount = await this.commentModel.countDocuments({
          postId: item._id.toString(),
          isActive: true,
          isDeleted: false,
        }).exec();
        const obj = item.toObject();
        return {
          ...obj,
          content: (obj as any).content || obj.body || '',
          commentCount,
        } as any;
      })
    );

    return {
      items: itemsWithCommentCount,
      total,
      skip,
      limit,
    };
  }

  async findOne(id: string): Promise<Post | null> {
    const post = await this.postModel.findById(id).populate('categoryId', 'name slug color').exec();
    if (!post) return null;

    post.viewCount = (post.viewCount || 0) + 1;
    await post.save();

    const commentCount = await this.commentModel.countDocuments({
      postId: post._id.toString(),
      isActive: true,
      isDeleted: false,
    }).exec();

    const obj = post.toObject();
    return {
      ...obj,
      content: (obj as any).content || obj.body || '',
      commentCount,
      viewCount: post.viewCount,
    } as any;
  }

  async findByAuthorId(
    authorId: string,
    skip: number,
    limit: number,
  ): Promise<PaginatedResponse<Post>> {
    const [items, total] = await Promise.all([
      this.postModel
        .find({ authorId, isActive: true, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postModel.countDocuments({ authorId, isActive: true, isDeleted: false }).exec(),
    ]);

    return {
      items,
      total,
      skip,
      limit,
    };
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

    const updateData = {
      ...updatePostDto,
    };
    if (updatePostDto.body !== undefined || updatePostDto.content !== undefined) {
      updateData.body = updatePostDto.body !== undefined ? updatePostDto.body : updatePostDto.content;
    }

    return this.postModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Post | null> {
    const post = await this.postModel.findByIdAndDelete(id).exec();

    if (post?.imageFilename) {
      await this.filesService.deleteImage(post.imageFilename);
    }

    if (post?.categoryId && this.categoriesService) {
      await this.categoriesService.decrementPostsCount(post.categoryId.toString());
    }

    return post;
  }

  async updateStatus(id: string, status: string): Promise<Post | null> {
    return this.postModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
  }

  async bulkCreate(createPostDtos: CreatePostDto[]): Promise<any> {
    const mapped = createPostDtos.map((dto) => ({
      ...dto,
      body: dto.body || dto.content,
    }));
    return this.postModel.insertMany(mapped);
  }
}
