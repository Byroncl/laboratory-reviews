import { Injectable, Optional } from '@nestjs/common';
import { CreateFavoriteDto } from '../dto/create-favorite.dto';
import { FavoriteResponseDto } from '../dto/favorite-response.dto';
import { NotificationsGateway } from '../../notifications/gateways/notifications.gateway';
import { FavoriteRepository } from '../domain/repositories/favorite.repository';

/**
 * FavoritesService acts as an orchestrator that delegates to the repository.
 * Handles business logic coordination (notifications) while data access is handled by the repository.
 */
@Injectable()
export class FavoritesService {
  constructor(
    private readonly favoriteRepository: FavoriteRepository,
    @Optional() private readonly notificationsGateway?: NotificationsGateway,
  ) {}

  async addFavorite(
    clientId: string,
    createFavoriteDto: CreateFavoriteDto,
  ): Promise<FavoriteResponseDto> {
    // Delegate to repository
    const result = await this.favoriteRepository.addFavorite(
      clientId,
      createFavoriteDto,
    );

    // Send notification to post author (business logic)
    if (this.notificationsGateway) {
      const post = await this.favoriteRepository.getPostById(
        createFavoriteDto.postId,
      );
      if (post && post.authorId) {
        this.notificationsGateway.notifyPostFavorited(
          post.authorId.toString(),
          'A user',
          post.title,
        );
      }
    }

    return result;
  }

  async removeFavorite(clientId: string, postId: string): Promise<void> {
    return this.favoriteRepository.removeFavorite(clientId, postId);
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
    return this.favoriteRepository.getMyFavorites(clientId, page, limit);
  }

  async isFavorite(clientId: string, postId: string): Promise<boolean> {
    return this.favoriteRepository.isFavorite(clientId, postId);
  }
}
