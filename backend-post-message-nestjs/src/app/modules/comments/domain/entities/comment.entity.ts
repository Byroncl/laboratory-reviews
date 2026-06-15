import {
  COMMENTS_CONFIG,
  COMMENTS_VALIDATION_MESSAGES,
} from '../../constants/comments.constants';
import { DomainException } from '../../../../core/exceptions/app.exceptions';

export class CommentEntity {
  readonly _id?: string;
  readonly content: string;
  readonly post: string;
  readonly user: string;
  readonly parentComment?: string;
  readonly childComments: string[];
  readonly isActive: boolean;
  readonly mediaUrls?: string[];
  readonly mediaTypes?: string[];
  readonly mediaFilenames?: string[];
  readonly createdAt: Date;
  readonly updatedAt?: Date;

  constructor(props: {
    _id?: string;
    content: string;
    post: string;
    user: string;
    parentComment?: string;
    childComments?: string[];
    isActive?: boolean;
    mediaUrls?: string[];
    mediaTypes?: string[];
    mediaFilenames?: string[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.validateContent(props.content);
    this.validatePost(props.post);
    this.validateUser(props.user);
    if (props.parentComment) {
      this.validateParentComment(props.parentComment);
    }
    if (props.mediaUrls && props.mediaUrls.length > 0) {
      this.validateMedia(props.mediaUrls, props.mediaTypes, props.mediaFilenames);
    }

    this._id = props._id;
    this.content = props.content.trim();
    this.post = props.post;
    this.user = props.user;
    this.parentComment = props.parentComment;
    this.childComments = props.childComments ?? [];
    this.isActive = props.isActive ?? true;
    this.mediaUrls = props.mediaUrls;
    this.mediaTypes = props.mediaTypes;
    this.mediaFilenames = props.mediaFilenames;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt;
  }

  private validateContent(content: string): void {
    if (!content || typeof content !== 'string') {
      throw new DomainException(COMMENTS_VALIDATION_MESSAGES.CONTENT_REQUIRED);
    }
    if (content.trim().length < COMMENTS_CONFIG.CONTENT_MIN_LENGTH) {
      throw new DomainException(COMMENTS_VALIDATION_MESSAGES.CONTENT_MIN_LENGTH);
    }
    if (content.length > COMMENTS_CONFIG.CONTENT_MAX_LENGTH) {
      throw new DomainException(COMMENTS_VALIDATION_MESSAGES.CONTENT_MAX_LENGTH);
    }
  }

  private validatePost(post: string): void {
    if (!post || typeof post !== 'string') {
      throw new DomainException(COMMENTS_VALIDATION_MESSAGES.POST_ID_REQUIRED);
    }
  }

  private validateUser(user: string): void {
    if (!user || typeof user !== 'string') {
      throw new DomainException(COMMENTS_VALIDATION_MESSAGES.USER_ID_REQUIRED);
    }
  }

  private validateParentComment(parentComment: string): void {
    if (!parentComment || typeof parentComment !== 'string') {
      throw new DomainException(COMMENTS_VALIDATION_MESSAGES.PARENT_COMMENT_ID_INVALID);
    }
  }

  private validateMedia(
    mediaUrls: string[],
    mediaTypes?: string[],
    mediaFilenames?: string[],
  ): void {
    if (!Array.isArray(mediaUrls)) {
      throw new DomainException(COMMENTS_VALIDATION_MESSAGES.MEDIA_URLS_INVALID);
    }
    if (mediaTypes && !Array.isArray(mediaTypes)) {
      throw new DomainException(COMMENTS_VALIDATION_MESSAGES.MEDIA_URLS_INVALID);
    }
    if (mediaFilenames && !Array.isArray(mediaFilenames)) {
      throw new DomainException(COMMENTS_VALIDATION_MESSAGES.MEDIA_URLS_INVALID);
    }
  }

  update(props: Partial<{
    content: string;
    mediaUrls: string[];
    mediaTypes: string[];
    mediaFilenames: string[];
    isActive: boolean;
  }>): CommentEntity {
    if (props.content) {
      this.validateContent(props.content);
    }
    if (props.mediaUrls) {
      this.validateMedia(props.mediaUrls, props.mediaTypes, props.mediaFilenames);
    }

    return new CommentEntity({
      _id: this._id,
      content: props.content ?? this.content,
      post: this.post,
      user: this.user,
      parentComment: this.parentComment,
      childComments: this.childComments,
      isActive: props.isActive ?? this.isActive,
      mediaUrls: props.mediaUrls ?? this.mediaUrls,
      mediaTypes: props.mediaTypes ?? this.mediaTypes,
      mediaFilenames: props.mediaFilenames ?? this.mediaFilenames,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  addChildComment(childCommentId: string): CommentEntity {
    return new CommentEntity({
      _id: this._id,
      content: this.content,
      post: this.post,
      user: this.user,
      parentComment: this.parentComment,
      childComments: [...this.childComments, childCommentId],
      isActive: this.isActive,
      mediaUrls: this.mediaUrls,
      mediaTypes: this.mediaTypes,
      mediaFilenames: this.mediaFilenames,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  removeChildComment(childCommentId: string): CommentEntity {
    return new CommentEntity({
      _id: this._id,
      content: this.content,
      post: this.post,
      user: this.user,
      parentComment: this.parentComment,
      childComments: this.childComments.filter(id => id !== childCommentId),
      isActive: this.isActive,
      mediaUrls: this.mediaUrls,
      mediaTypes: this.mediaTypes,
      mediaFilenames: this.mediaFilenames,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  activate(): CommentEntity {
    return this.update({ isActive: true });
  }

  deactivate(): CommentEntity {
    return this.update({ isActive: false });
  }

  hasNestingLimit(currentLevel: number): boolean {
    return currentLevel >= COMMENTS_CONFIG.MAX_NESTING_LEVEL;
  }

  hasChildren(): boolean {
    return this.childComments.length > 0;
  }
}
