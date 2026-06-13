export const API_PREFIX = 'api';

export const API_VERSION = {
  V1: '1',
  V2: '2',
} as const;

export const API_PATHS = {
  AUTH: 'auth',
  USERS: 'users',
} as const;

export const CRUD_ROUTES = {
  CREATE: 'create',
  FIND_ALL: 'get-all',
  FIND_ONE: 'get-one/:id',
  UPDATE: 'update/:id',
  REMOVE: 'remove/:id',
  DESACTIVATE: 'deactivate/:id',
} as const;

export const REF_MODELS = {
  USER: 'User',
} as const;

export const API_PARAMS = {
  ID: 'id',
};

export const API_DOCS_PATH = 'docs' as const;

export const METHOD_CRUD = {
  POST: 'POST',
  GET: 'GET',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};
