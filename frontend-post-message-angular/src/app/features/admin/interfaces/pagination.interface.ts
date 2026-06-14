export interface IPagination {
  skip: number;
  limit: number;
  total: number;
}

export interface IPaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}
