export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [10, 25, 50, 100] as const,
  MIN_PAGE_SIZE: 5,
  MAX_PAGE_SIZE: 100
} as const;

export type PageSizeType = typeof PAGINATION_CONFIG.PAGE_SIZES[number];

export const PAGINATION_DEFAULTS = {
  skip: 0,
  limit: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
  total: 0
} as const;
