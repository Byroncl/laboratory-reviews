import { Favorite } from '../../schemas/favorite.schema';
import { CreateFavoriteDto } from '../../dto/create-favorite.dto';
import { FavoriteResponseDto } from '../../dto/favorite-response.dto';
import { Post } from '../../../posts/schemas/post.schema';

/**
 * Abstract repository for favorite operations.
 * Defines the contract for favorite-specific data access logic.
 */
export abstract class FavoriteRepository {
  /**
   * Add a post to favorites.
   * @param clientId - The client user ID
   * @param createFavoriteDto - Data for creating a favorite
   * @returns The created favorite
   * @throws BadRequestException if invalid IDs or post already favorited
   * @throws NotFoundException if post not found
   */
  abstract addFavorite(
    clientId: string,
    createFavoriteDto: CreateFavoriteDto,
  ): Promise<FavoriteResponseDto>;

  /**
   * Remove a post from favorites.
   * @param clientId - The client user ID
   * @param postId - The post ID to remove
   * @throws BadRequestException if invalid IDs
   * @throws NotFoundException if favorite not found
   */
  abstract removeFavorite(clientId: string, postId: string): Promise<void>;

  /**
   * Get all favorites for a client with pagination.
   * @param clientId - The client user ID
   * @param page - Page number (1-indexed)
   * @param limit - Items per page
   * @returns Paginated favorites and total count
   * @throws BadRequestException if invalid client ID
   */
  abstract getMyFavorites(
    clientId: string,
    page: number,
    limit: number,
  ): Promise<{
    data: FavoriteResponseDto[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * Check if a post is favorited by a client.
   * @param clientId - The client user ID
   * @param postId - The post ID
   * @returns True if post is favorited, false otherwise
   */
  abstract isFavorite(clientId: string, postId: string): Promise<boolean>;

  /**
   * Get a post by its ID.
   * @param postId - The post ID
   * @returns The post or null if not found
   */
  abstract getPostById(postId: string): Promise<Post | null>;
}
