import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FavoriteRepository } from '../../domain/repositories/favorite.repository';
import { Favorite, FavoriteDocument } from '../../schemas/favorite.schema';
import { CreateFavoriteDto } from '../../dto/create-favorite.dto';
import { FavoriteResponseDto } from '../../dto/favorite-response.dto';
import { Post, PostDocument } from '../../../posts/schemas/post.schema';
import { I18nService } from '../../../../core/i18n/i18n.service';

/**
 * Concrete implementation of FavoriteRepository using MongoDB.
 * Handles all favorite-specific data access operations.
 */
@Injectable()
export class FavoriteMongoRepository implements FavoriteRepository {
  constructor(
    @InjectModel(Favorite.name) private readonly favoriteModel: Model<FavoriteDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    private readonly i18nService: I18nService,
  ) {}

  async addFavorite(
    clientId: string,
    createFavoriteDto: CreateFavoriteDto,
  ): Promise<FavoriteResponseDto> {
    const postId = createFavoriteDto.postId;

    // Validate IDs
    if (!Types.ObjectId.isValid(clientId)) {
      throw new BadRequestException(
        this.i18nService.translate('favorites.invalid_client_id'),
      );
    }

    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException(
        this.i18nService.translate('favorites.invalid_post_id'),
      );
    }

    // Check if post exists
    const postExists = await this.postModel.findById(postId).exec();
    if (!postExists) {
      throw new NotFoundException(
        this.i18nService.translate('favorites.post_not_found'),
      );
    }

    // Check if already favorited
    const existingFavorite = await this.favoriteModel
      .findOne({
        clientId: new Types.ObjectId(clientId),
        postId: new Types.ObjectId(postId),
        isDeleted: false,
      })
      .exec();

    if (existingFavorite) {
      throw new BadRequestException(
        this.i18nService.translate('favorites.already_favorited'),
      );
    }

    // Create favorite
    const favorite = new this.favoriteModel({
      clientId: new Types.ObjectId(clientId),
      postId: new Types.ObjectId(postId),
    });

    const saved = await favorite.save();

    return this.populateFavoriteResponse(saved);
  }

  async removeFavorite(clientId: string, postId: string): Promise<void> {
    // Validate IDs
    if (!Types.ObjectId.isValid(clientId)) {
      throw new BadRequestException(
        this.i18nService.translate('favorites.invalid_client_id'),
      );
    }

    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException(
        this.i18nService.translate('favorites.invalid_post_id'),
      );
    }

    // Mark as deleted
    const result = await this.favoriteModel
      .findOneAndUpdate(
        {
          clientId: new Types.ObjectId(clientId),
          postId: new Types.ObjectId(postId),
          isDeleted: false,
        },
        { isDeleted: true },
        { new: true },
      )
      .exec();

    if (!result) {
      throw new NotFoundException(
        this.i18nService.translate('favorites.not_found'),
      );
    }
  }

  async getMyFavorites(
    clientId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    data: FavoriteResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Validate ID
    if (!Types.ObjectId.isValid(clientId)) {
      throw new BadRequestException(
        this.i18nService.translate('favorites.invalid_client_id'),
      );
    }

    const skip = (page - 1) * limit;

    // Get favorites with post data
    const [favorites, total] = await Promise.all([
      this.favoriteModel
        .find({
          clientId: new Types.ObjectId(clientId),
          isDeleted: false,
        })
        .populate('postId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.favoriteModel
        .countDocuments({
          clientId: new Types.ObjectId(clientId),
          isDeleted: false,
        })
        .exec(),
    ]);

    return {
      data: favorites.map((fav) => this.populateFavoriteResponse(fav)),
      total,
      page,
      limit,
    };
  }

  async isFavorite(clientId: string, postId: string): Promise<boolean> {
    // Validate IDs
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

  async getPostById(postId: string): Promise<Post | null> {
    return this.postModel.findById(postId).exec();
  }

  /**
   * Helper method to transform favorite document to response DTO
   */
  private populateFavoriteResponse(
    favorite: FavoriteDocument,
  ): FavoriteResponseDto {
    return {
      _id: favorite._id.toString(),
      clientId: favorite.clientId.toString(),
      postId: favorite.postId.toString(),
      createdAt: favorite.createdAt,
      updatedAt: favorite.updatedAt,
    };
  }
}
