import {
  CATEGORY_VALIDATION,
  CATEGORY_VALIDATION_MESSAGES,
} from '../../constants/category.constants';
import { DomainException } from '../../../../core/exceptions/app.exceptions';

export class CategoryEntity {
  readonly _id?: string;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly color: string;
  readonly postsCount: number;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    _id?: string;
    name: string;
    slug: string;
    description?: string;
    color: string;
    postsCount?: number;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.validateName(props.name);
    this.validateSlug(props.slug);
    this.validateDescription(props.description);
    this.validateColor(props.color);

    this._id = props._id;
    this.name = props.name.trim();
    this.slug = props.slug.toLowerCase().trim();
    this.description = props.description?.trim();
    this.color = props.color;
    this.postsCount = props.postsCount ?? 0;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new DomainException(CATEGORY_VALIDATION_MESSAGES.NAME_REQUIRED);
    }
    if (name.length < CATEGORY_VALIDATION.NAME_MIN_LENGTH) {
      throw new DomainException(CATEGORY_VALIDATION_MESSAGES.NAME_MIN_LENGTH);
    }
    if (name.length > CATEGORY_VALIDATION.NAME_MAX_LENGTH) {
      throw new DomainException(CATEGORY_VALIDATION_MESSAGES.NAME_MAX_LENGTH);
    }
  }

  private validateSlug(slug: string): void {
    if (!slug || slug.trim().length === 0) {
      throw new DomainException(CATEGORY_VALIDATION_MESSAGES.SLUG_REQUIRED);
    }
    if (slug.length < CATEGORY_VALIDATION.SLUG_MIN_LENGTH) {
      throw new DomainException(CATEGORY_VALIDATION_MESSAGES.SLUG_MIN_LENGTH);
    }
    if (slug.length > CATEGORY_VALIDATION.SLUG_MAX_LENGTH) {
      throw new DomainException(CATEGORY_VALIDATION_MESSAGES.SLUG_MAX_LENGTH);
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new DomainException(CATEGORY_VALIDATION_MESSAGES.SLUG_PATTERN);
    }
  }

  private validateDescription(description?: string): void {
    if (description && description.length > CATEGORY_VALIDATION.DESCRIPTION_MAX_LENGTH) {
      throw new DomainException(CATEGORY_VALIDATION_MESSAGES.DESCRIPTION_MAX_LENGTH);
    }
  }

  private validateColor(color: string): void {
    if (!CATEGORY_VALIDATION.COLOR_REGEX.test(color)) {
      throw new DomainException(CATEGORY_VALIDATION_MESSAGES.COLOR_INVALID);
    }
  }

  update(props: Partial<{
    name: string;
    slug: string;
    description?: string;
    color: string;
    isActive: boolean;
  }>): CategoryEntity {
    return new CategoryEntity({
      _id: this._id,
      name: props.name ?? this.name,
      slug: props.slug ?? this.slug,
      description: props.description ?? this.description,
      color: props.color ?? this.color,
      postsCount: this.postsCount,
      isActive: props.isActive ?? this.isActive,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  incrementPostsCount(): CategoryEntity {
    return new CategoryEntity({
      _id: this._id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      color: this.color,
      postsCount: this.postsCount + 1,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  decrementPostsCount(): CategoryEntity {
    return new CategoryEntity({
      _id: this._id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      color: this.color,
      postsCount: Math.max(0, this.postsCount - 1),
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  canDelete(): boolean {
    return this.postsCount === 0;
  }

  activate(): CategoryEntity {
    return this.update({ isActive: true });
  }

  deactivate(): CategoryEntity {
    return this.update({ isActive: false });
  }

  generateSlug(name?: string): string {
    return (name ?? this.name)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
