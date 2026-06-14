import {
  POSTS_CONFIG,
  POSTS_VALIDATION_MESSAGES,
} from '../../constants/posts.constants';
import { DomainException } from '../../../core/exceptions/app.exceptions';

export class PostEntity {
  readonly _id?: string;
  readonly title: string;
  readonly content: string;
  readonly imageUrl?: string;
  readonly imageFilename?: string;
  readonly categoryId?: string;
  readonly categoryName?: string;
  readonly authorId: string;
  readonly author: string;
  readonly authorAvatar?: string;
  readonly isActive: boolean;
  readonly isDeleted: boolean;
  readonly status: string;
  readonly commentsCount: number;
  readonly likesCount: number;
  readonly createdAt: Date;
  readonly updatedAt?: Date;

  constructor(props: {
    _id?: string;
    title: string;
    content: string;
    imageUrl?: string;
    imageFilename?: string;
    categoryId?: string;
    categoryName?: string;
    authorId: string;
    author: string;
    authorAvatar?: string;
    isActive?: boolean;
    isDeleted?: boolean;
    status?: string;
    commentsCount?: number;
    likesCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.validateTitle(props.title);
    this.validateContent(props.content);
    this.validateAuthorId(props.authorId);
    if (props.imageUrl) {
      this.validateImageUrl(props.imageUrl);
    }
    if (props.imageFilename) {
      this.validateImageFilename(props.imageFilename);
    }
    if (props.categoryId) {
      this.validateCategoryId(props.categoryId);
    }
    if (props.categoryName) {
      this.validateCategoryName(props.categoryName);
    }

    this._id = props._id;
    this.title = props.title.trim();
    this.content = props.content.trim();
    this.imageUrl = props.imageUrl;
    this.imageFilename = props.imageFilename;
    this.categoryId = props.categoryId;
    this.categoryName = props.categoryName;
    this.authorId = props.authorId;
    this.author = props.author;
    this.authorAvatar = props.authorAvatar;
    this.isActive = props.isActive ?? true;
    this.isDeleted = props.isDeleted ?? false;
    this.status = props.status ?? 'published';
    this.commentsCount = props.commentsCount ?? 0;
    this.likesCount = props.likesCount ?? 0;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt;
  }

  private validateTitle(title: string): void {
    if (!title || typeof title !== 'string') {
      throw new DomainException(POSTS_VALIDATION_MESSAGES.TITLE_REQUIRED);
    }
    if (title.length < POSTS_CONFIG.TITLE_MIN_LENGTH) {
      throw new DomainException(POSTS_VALIDATION_MESSAGES.TITLE_MIN_LENGTH);
    }
    if (title.length > POSTS_CONFIG.TITLE_MAX_LENGTH) {
      throw new DomainException(POSTS_VALIDATION_MESSAGES.TITLE_MAX_LENGTH);
    }
  }

  private validateContent(content: string): void {
    if (!content || typeof content !== 'string') {
      throw new DomainException(POSTS_VALIDATION_MESSAGES.CONTENT_REQUIRED);
    }
    if (content.length < POSTS_CONFIG.CONTENT_MIN_LENGTH) {
      throw new DomainException(POSTS_VALIDATION_MESSAGES.CONTENT_MIN_LENGTH);
    }
    if (content.length > POSTS_CONFIG.CONTENT_MAX_LENGTH) {
      throw new DomainException(POSTS_VALIDATION_MESSAGES.CONTENT_MAX_LENGTH);
    }
  }

  private validateAuthorId(authorId: string): void {
    if (!authorId || typeof authorId !== 'string') {
      throw new DomainException(POSTS_VALIDATION_MESSAGES.AUTHOR_ID_REQUIRED);
    }
  }

  private validateImageUrl(imageUrl: string): void {
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new DomainException(POSTS_VALIDATION_MESSAGES.IMAGE_URL_INVALID);
    }
    try {
      new URL(imageUrl);
    } catch {
      throw new DomainException(POSTS_VALIDATION_MESSAGES.IMAGE_URL_INVALID);
    }
  }

  private validateImageFilename(imageFilename: string): void {
    if (!imageFilename || typeof imageFilename !== 'string') {
      throw new DomainException(POSTS_VALIDATION_MESSAGES.IMAGE_FILENAME_INVALID);
    }
    if (imageFilename.length > POSTS_CONFIG.IMAGE_FILENAME_MAX_LENGTH) {
      throw new DomainException(POSTS_VALIDATION_MESSAGES.IMAGE_FILENAME_MAX_LENGTH);
    }
  }

  private validateCategoryId(categoryId: string): void {
    if (!categoryId || typeof categoryId !== 'string') {
      throw new DomainException(POSTS_VALIDATION_MESSAGES.CATEGORY_ID_INVALID);
    }
  }

  private validateCategoryName(categoryName: string): void {
    if (!categoryName || typeof categoryName !== 'string') {
      throw new DomainException(POSTS_VALIDATION_MESSAGES.CATEGORY_NAME_INVALID);
    }
    if (categoryName.length < POSTS_CONFIG.CATEGORY_NAME_MIN_LENGTH) {
      throw new DomainException(POSTS_VALIDATION_MESSAGES.CATEGORY_NAME_MIN_LENGTH);
    }
    if (categoryName.length > POSTS_CONFIG.CATEGORY_NAME_MAX_LENGTH) {
      throw new DomainException(POSTS_VALIDATION_MESSAGES.CATEGORY_NAME_MAX_LENGTH);
    }
  }

  update(props: Partial<{
    title: string;
    content: string;
    imageUrl: string;
    imageFilename: string;
    categoryId: string;
    categoryName: string;
    status: string;
    isActive: boolean;
  }>): PostEntity {
    if (props.title) {
      this.validateTitle(props.title);
    }
    if (props.content) {
      this.validateContent(props.content);
    }
    if (props.imageUrl) {
      this.validateImageUrl(props.imageUrl);
    }
    if (props.imageFilename) {
      this.validateImageFilename(props.imageFilename);
    }
    if (props.categoryId) {
      this.validateCategoryId(props.categoryId);
    }
    if (props.categoryName) {
      this.validateCategoryName(props.categoryName);
    }

    return new PostEntity({
      _id: this._id,
      title: props.title ?? this.title,
      content: props.content ?? this.content,
      imageUrl: props.imageUrl ?? this.imageUrl,
      imageFilename: props.imageFilename ?? this.imageFilename,
      categoryId: props.categoryId ?? this.categoryId,
      categoryName: props.categoryName ?? this.categoryName,
      authorId: this.authorId,
      author: this.author,
      authorAvatar: this.authorAvatar,
      isActive: props.isActive ?? this.isActive,
      isDeleted: this.isDeleted,
      status: props.status ?? this.status,
      commentsCount: this.commentsCount,
      likesCount: this.likesCount,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  activate(): PostEntity {
    return this.update({ isActive: true });
  }

  deactivate(): PostEntity {
    return this.update({ isActive: false });
  }

  softDelete(): PostEntity {
    return new PostEntity({
      _id: this._id,
      title: this.title,
      content: this.content,
      imageUrl: this.imageUrl,
      imageFilename: this.imageFilename,
      categoryId: this.categoryId,
      categoryName: this.categoryName,
      authorId: this.authorId,
      author: this.author,
      authorAvatar: this.authorAvatar,
      isActive: this.isActive,
      isDeleted: true,
      status: this.status,
      commentsCount: this.commentsCount,
      likesCount: this.likesCount,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  incrementCommentsCount(): PostEntity {
    return new PostEntity({
      _id: this._id,
      title: this.title,
      content: this.content,
      imageUrl: this.imageUrl,
      imageFilename: this.imageFilename,
      categoryId: this.categoryId,
      categoryName: this.categoryName,
      authorId: this.authorId,
      author: this.author,
      authorAvatar: this.authorAvatar,
      isActive: this.isActive,
      isDeleted: this.isDeleted,
      status: this.status,
      commentsCount: this.commentsCount + 1,
      likesCount: this.likesCount,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  decrementCommentsCount(): PostEntity {
    return new PostEntity({
      _id: this._id,
      title: this.title,
      content: this.content,
      imageUrl: this.imageUrl,
      imageFilename: this.imageFilename,
      categoryId: this.categoryId,
      categoryName: this.categoryName,
      authorId: this.authorId,
      author: this.author,
      authorAvatar: this.authorAvatar,
      isActive: this.isActive,
      isDeleted: this.isDeleted,
      status: this.status,
      commentsCount: Math.max(0, this.commentsCount - 1),
      likesCount: this.likesCount,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  incrementLikesCount(): PostEntity {
    return new PostEntity({
      _id: this._id,
      title: this.title,
      content: this.content,
      imageUrl: this.imageUrl,
      imageFilename: this.imageFilename,
      categoryId: this.categoryId,
      categoryName: this.categoryName,
      authorId: this.authorId,
      author: this.author,
      authorAvatar: this.authorAvatar,
      isActive: this.isActive,
      isDeleted: this.isDeleted,
      status: this.status,
      commentsCount: this.commentsCount,
      likesCount: this.likesCount + 1,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  decrementLikesCount(): PostEntity {
    return new PostEntity({
      _id: this._id,
      title: this.title,
      content: this.content,
      imageUrl: this.imageUrl,
      imageFilename: this.imageFilename,
      categoryId: this.categoryId,
      categoryName: this.categoryName,
      authorId: this.authorId,
      author: this.author,
      authorAvatar: this.authorAvatar,
      isActive: this.isActive,
      isDeleted: this.isDeleted,
      status: this.status,
      commentsCount: this.commentsCount,
      likesCount: Math.max(0, this.likesCount - 1),
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  isPublished(): boolean {
    return this.status === 'published' && !this.isDeleted;
  }

  isDraft(): boolean {
    return this.status === 'draft';
  }
}
