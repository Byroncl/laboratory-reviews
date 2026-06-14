export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  postsCount?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICategoryRepository {
  create(category: ICategory): Promise<ICategory>;
  findById(id: string): Promise<ICategory | null>;
  findBySlug(slug: string): Promise<ICategory | null>;
  findAll(skip: number, limit: number, filters?: any): Promise<{ items: ICategory[]; total: number }>;
  findActive(): Promise<ICategory[]>;
  update(id: string, category: Partial<ICategory>): Promise<ICategory | null>;
  delete(id: string): Promise<void>;
  bulkCreate(categories: ICategory[]): Promise<ICategory[]>;
  incrementPostsCount(id: string): Promise<void>;
  decrementPostsCount(id: string): Promise<void>;
}

export interface ICategoryUseCase {
  createCategory(data: ICategory): Promise<ICategory>;
  getCategoryById(id: string): Promise<ICategory | null>;
  getCategoryBySlug(slug: string): Promise<ICategory | null>;
  getAllCategories(page: number, limit: number, filters?: any): Promise<{
    items: ICategory[];
    total: number;
    page: number;
    limit: number;
  }>;
  getActiveCategories(): Promise<ICategory[]>;
  updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory | null>;
  deleteCategory(id: string): Promise<void>;
  bulkCreateCategories(categories: ICategory[]): Promise<ICategory[]>;
}
