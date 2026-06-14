import { Comment } from '../../schemas/comment.schema';
import { CreateCommentDto } from '../../dto/create-comment.dto';
import { UpdateCommentDto } from '../../dto/update-comment.dto';
import { CommentResponseDto } from '../../dto/comment-response.dto';
import { CommentTreeNodeDto, CommentThreadDto } from '../../dto/comment-tree.dto';
import { Post } from '../../../posts/schemas/post.schema';

/**
 * Abstract repository for comment operations.
 * Defines the contract for comment-specific data access logic.
 */
export abstract class CommentRepository {
  /**
   * Create a new comment.
   * @param createCommentDto - Data for creating a comment
   * @returns The created comment
   */
  abstract create(createCommentDto: CreateCommentDto): Promise<Comment>;

  /**
   * Find all comments, optionally filtered by post ID.
   * @param postId - Optional post ID filter
   * @returns Array of comments
   */
  abstract findAll(postId?: string): Promise<Comment[]>;

  /**
   * Find a comment by ID.
   * @param id - The comment ID
   * @returns The comment or null if not found
   */
  abstract findOne(id: string): Promise<Comment | null>;

  /**
   * Find comments by user ID with pagination.
   * @param userId - The user ID
   * @param skip - Number of records to skip
   * @param limit - Number of records to return
   * @returns Paginated comments and total count
   */
  abstract findByUserId(
    userId: string,
    skip: number,
    limit: number,
  ): Promise<{ data: Comment[]; total: number }>;

  /**
   * Update a comment.
   * @param id - The comment ID
   * @param updateCommentDto - Data to update
   * @returns The updated comment or null if not found
   */
  abstract update(
    id: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment | null>;

  /**
   * Remove a comment (cascades to child comments).
   * @param id - The comment ID
   * @throws NotFoundException if comment not found
   */
  abstract remove(id: string): Promise<void>;

  /**
   * Create a reply to a comment.
   * @param createCommentDto - Data for creating the reply
   * @throws NotFoundException if parent comment not found
   * @throws BadRequestException if max nesting level exceeded
   */
  abstract createReply(createCommentDto: CreateCommentDto): Promise<Comment>;

  /**
   * Get a comment with all its replies as a tree.
   * @param commentId - The comment ID
   * @returns Comment tree node with replies
   * @throws NotFoundException if comment not found
   */
  abstract getCommentWithReplies(commentId: string): Promise<CommentTreeNodeDto>;

  /**
   * Get the full thread for a comment (walks to root if needed).
   * @param commentId - The comment ID
   * @returns Full thread with root comment and total count
   * @throws NotFoundException if comment not found
   */
  abstract getCommentThread(commentId: string): Promise<CommentThreadDto>;

  /**
   * Get replies to a comment with pagination.
   * @param parentCommentId - The parent comment ID
   * @param pagination - Skip and limit options
   * @returns Paginated replies and total count
   */
  abstract getReplies(
    parentCommentId: string,
    pagination?: { skip?: number; limit?: number },
  ): Promise<{ items: CommentResponseDto[]; total: number }>;

  /**
   * Get a post by its ID.
   * @param postId - The post ID
   * @returns The post or null if not found
   */
  abstract getPostByCommentPostId(postId: string): Promise<Post | null>;
}
