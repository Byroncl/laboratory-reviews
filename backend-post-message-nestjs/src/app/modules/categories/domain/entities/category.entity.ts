import { CATEGORY_VALIDATION, CATEGORY_MESSAGES } from '../../constants/category.constants';

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
      throw new Error(CATEGORY_MESSAGES.NAME_REQUIRED);
    }
    if (name.length < CATEGORY_VALIDATION.NAME_MIN_LENGTH) {
      throw new Error(CATEGORY_MESSAGES.NAME_TOO_SHORT);
    }
    if (name.length > CATEGORY_VALIDATION.NAME_MAX_LENGTH) {
      throw new Error(CATEGORY_MESSAGES.NAME_TOO_LONG);
    }
  }

  private validateSlug(slug: string): void {
    if (!slug || slug.trim().length === 0) {
      throw new Error(CATEGORY_MESSAGES.SLUG_REQUIRED);
    }
    if (slug.length < CATEGORY_VALIDATION.SLUG_MIN_LENGTH) {
      throw new Error('El slug debe tener al menos 2 caracteres');
    }
    if (slug.length > CATEGORY_VALIDATION.SLUG_MAX_LENGTH) {
      throw new Error('El slug no puede exceder 100 caracteres');
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error('El slug solo puede contener letras minúsculas, números y guiones');
    }
  }

  private validateDescription(description?: string): void {
    if (description && description.length > CATEGORY_VALIDATION.DESCRIPTION_MAX_LENGTH) {
      throw new Error(CATEGORY_MESSAGES.DESCRIPTION_TOO_LONG);
    }
  }

  private validateColor(color: string): void {
    if (!CATEGORY_VALIDATION.COLOR_REGEX.test(color)) {
      throw new Error(CATEGORY_MESSAGES.INVALID_COLOR);
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

  generateSlug(): string {
    return this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
