export const CLIENT_ENDPOINTS = {
  POSTS: {
    BASE: '/api/posts',
    MY_POSTS: '/api/posts/my-posts',
    GET_BY_ID: (id: string) => `/api/posts/${id}`,
    CREATE: '/api/posts',
    UPDATE: (id: string) => `/api/posts/${id}`,
    DELETE: (id: string) => `/api/posts/${id}`,
  },
  COMMENTS: {
    BASE: '/api/comments',
    MY_COMMENTS: '/api/comments/my-comments',
    CREATE: '/api/comments',
    DELETE: (id: string) => `/api/comments/${id}`,
  },
  FAVORITES: {
    BASE: '/api/favorites',
    GET_MY_FAVORITES: '/api/favorites',
    CREATE: '/api/favorites',
    DELETE: (postId: string) => `/api/favorites/${postId}`,
    CHECK: (postId: string) => `/api/favorites/check/${postId}`,
  },
  PROFILE: {
    BASE: '/api/clients',
    GET_PROFILE: '/api/clients/profile',
    UPDATE_PROFILE: '/api/clients/profile',
    CHANGE_PASSWORD: '/api/clients/change-password',
  },
};

export const CLIENT_PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};
