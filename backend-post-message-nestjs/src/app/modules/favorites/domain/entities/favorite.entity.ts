import {
  FAVORITES_CONFIG,
  FAVORITES_VALIDATION_MESSAGES,
} from '../../constants/favorites.constants';
import { DomainException } from '../../../../core/exceptions/app.exceptions';

export class FavoriteEntity {
  readonly _id?: string;
  readonly clientId: string;
  readonly postId: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;

  constructor(props: {
    _id?: string;
    clientId: string;
    postId: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.validateClientId(props.clientId);
    this.validatePostId(props.postId);

    this._id = props._id;
    this.clientId = props.clientId;
    this.postId = props.postId;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt;
  }

  private validateClientId(clientId: string): void {
    if (!clientId || typeof clientId !== 'string') {
      throw new DomainException(FAVORITES_VALIDATION_MESSAGES.CLIENT_ID_INVALID);
    }
    if (clientId.trim().length === 0) {
      throw new DomainException(FAVORITES_VALIDATION_MESSAGES.CLIENT_ID_INVALID);
    }
  }

  private validatePostId(postId: string): void {
    if (!postId || typeof postId !== 'string') {
      throw new DomainException(FAVORITES_VALIDATION_MESSAGES.POST_ID_REQUIRED);
    }
    if (postId.trim().length === 0) {
      throw new DomainException(FAVORITES_VALIDATION_MESSAGES.POST_ID_INVALID);
    }
  }

  isOwnedBy(clientId: string): boolean {
    return this.clientId === clientId;
  }

  isFavoriteOf(postId: string): boolean {
    return this.postId === postId;
  }
}
