import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { FilesService } from '../../files/services/files.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private readonly filesService: FilesService,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const createdPost = new this.postModel(createPostDto);
    return createdPost.save();
  }

  async findAll(): Promise<Post[]> {
    return this.postModel.find().exec();
  }

  async findOne(id: string): Promise<Post | null> {
    return this.postModel.findById(id).exec();
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post | null> {
    const existing = await this.postModel.findById(id).exec();

    if (existing?.imageFilename && updatePostDto.imageFilename && existing.imageFilename !== updatePostDto.imageFilename) {
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

    return post;
  }

  async bulkCreate(createPostDtos: CreatePostDto[]): Promise<any> {
    return this.postModel.insertMany(createPostDtos);
  }
}
