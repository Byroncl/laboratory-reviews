import { Injectable, BadRequestException, NotFoundException, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Favorite, FavoriteDocument } from '../schemas/favorite.schema';
import { CreateFavoriteDto } from '../dto/create-favorite.dto';
import { Post, PostDocument } from '../../posts/schemas/post.schema';
import { FavoriteResponseDto } from '../dto/favorite-response.dto';
import { NotificationsGateway } from '../../notifications/gateways/notifications.gateway';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite.name) private favoriteModel: Model<FavoriteDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @Optional() private notificationsGateway?: NotificationsGateway,
  ) {}

  async addFavorite(clientId: string, createFavoriteDto: CreateFavoriteDto): Promise<FavoriteResponseDto> {
    const postId = createFavoriteDto.postId;

    if (!Types.ObjectId.isValid(clientId)) {
      throw new BadRequestException('Invalid client ID');
    }

    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid post ID');
    }

    const postExists = await this.postModel.findById(postId).exec();
    if (!postExists) {
      throw new NotFoundException('Post not found');
    }

    const existingFavorite = await this.favoriteModel
      .findOne({
        clientId: new Types.ObjectId(clientId),
        postId: new Types.ObjectId(postId),
        isDeleted: false,
      })
      .exec();

    if (existingFavorite) {
      throw new BadRequestException('This post is already in your favorites');
    }

    const favorite = new this.favoriteModel({
      clientId: new Types.ObjectId(clientId),
      postId: new Types.ObjectId(postId),
    });

    const saved = await favorite.save();

    if (this.notificationsGateway && postExists.authorId) {
      this.notificationsGateway.notifyPostFavorited(
        postExists.authorId.toString(),
        'A user',
        postExists.title,
      );
    }

    return this.populateFavoriteResponse(saved);
  }

  async removeFavorite(clientId: string, postId: string): Promise<void> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new BadRequestException('Invalid client ID');
    }

    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid post ID');
    }

    const result = await this.favoriteModel.findOneAndUpdate(
      {
        clientId: new Types.ObjectId(clientId),
        postId: new Types.ObjectId(postId),
        isDeleted: false,
      },
      { isDeleted: true },
      { new: true },
    ).exec();

    if (!result) {
      throw new NotFoundException('Favorite not found');
    }
  }

  async getMyFavorites(clientId: string, page = 1, limit = 10): Promise<{
    data: FavoriteResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new BadRequestException('Invalid client ID');
    }

    const skip = (page - 1) * limit;

    const favorites = await this.favoriteModel
      .find({
        clientId: new Types.ObjectId(clientId),
        isDeleted: false,
      })
      .populate('postId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.favoriteModel
      .countDocuments({
        clientId: new Types.ObjectId(clientId),
        isDeleted: false,
      })
      .exec();

    return {
      data: favorites.map(fav => this.populateFavoriteResponse(fav)),
      total,
      page,
      limit,
    };
  }

  async isFavorite(clientId: string, postId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(clientId) || !Types.ObjectId.isValid(postId)) {
      return false;
    }

    const favorite = await this.favoriteModel
      .findOne({
        clientId: new Types.ObjectId(clientId),
        postId: new Types.ObjectId(postId),
        isDeleted: false,
      })
      .exec();

    return !!favorite;
  }

  private populateFavoriteResponse(favorite: FavoriteDocument): FavoriteResponseDto {
    return {
      _id: favorite._id.toString(),
      clientId: favorite.clientId.toString(),
      postId: favorite.postId.toString(),
      createdAt: favorite.createdAt,
      updatedAt: favorite.updatedAt,
    };
  }
}
