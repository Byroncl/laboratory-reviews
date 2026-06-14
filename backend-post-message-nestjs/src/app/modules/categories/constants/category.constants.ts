// Category Validation Rules
export const CATEGORY_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  SLUG_MIN_LENGTH: 2,
  SLUG_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  COLOR_REGEX: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
};

// Category Messages (i18n keys)
export const CATEGORY_MESSAGES = {
  CREATED: 'categories.created',
  UPDATED: 'categories.updated',
  DELETED: 'categories.deleted',
  NOT_FOUND: 'categories.not_found',
};

// Category Validation Messages (i18n keys)
export const CATEGORY_VALIDATION_MESSAGES = {
  // Name
  NAME_REQUIRED: 'categories.validation_name_required',
  NAME_MIN_LENGTH: 'categories.validation_name_minLength',
  NAME_MAX_LENGTH: 'categories.validation_name_maxLength',
  NAME_ALREADY_EXISTS: 'categories.validation_name_exists',

  // Slug
  SLUG_REQUIRED: 'categories.validation_slug_required',
  SLUG_MIN_LENGTH: 'categories.validation_slug_minLength',
  SLUG_MAX_LENGTH: 'categories.validation_slug_maxLength',
  SLUG_PATTERN: 'categories.validation_slug_pattern',
  SLUG_ALREADY_EXISTS: 'categories.validation_slug_exists',

  // Color
  COLOR_INVALID: 'categories.validation_color_invalid',

  // Description
  DESCRIPTION_MAX_LENGTH: 'categories.validation_description_maxLength',

  // Delete
  CANNOT_DELETE_WITH_POSTS: 'categories.validation_cannot_delete_with_posts',
};

// Category Swagger Documentation
export const CATEGORY_SWAGGER = {
  GET_ALL: {
    SUMMARY: 'Obtener todas las categorías',
    DESCRIPTION:
      'Retorna una lista paginada de todas las categorías con conteo de posts',
    EXAMPLE: {
      data: {
        items: [
          {
            id: '507f1f77bcf86cd799439011',
            name: 'Tecnología',
            slug: 'tecnologia',
            description: 'Posts sobre tecnología e innovación',
            color: '#3B82F6',
            postsCount: 15,
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
      message: 'Categorías obtenidas exitosamente',
      success: true,
    },
  },

  GET_ONE: {
    SUMMARY: 'Obtener una categoría por ID',
    DESCRIPTION: 'Retorna los detalles de una categoría específica',
    EXAMPLE: {
      data: {
        id: '507f1f77bcf86cd799439011',
        name: 'Tecnología',
        slug: 'tecnologia',
        description: 'Posts sobre tecnología e innovación',
        color: '#3B82F6',
        postsCount: 15,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      },
      message: 'Categoría obtenida exitosamente',
      success: true,
    },
  },

  CREATE: {
    SUMMARY: 'Crear una nueva categoría',
    DESCRIPTION: 'Crea una nueva categoría en el sistema',
    EXAMPLE: {
      data: {
        id: '507f1f77bcf86cd799439011',
        name: 'Tecnología',
        slug: 'tecnologia',
        description: 'Posts sobre tecnología e innovación',
        color: '#3B82F6',
        postsCount: 0,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      },
      message: 'Categoría creada exitosamente',
      success: true,
    },
  },

  UPDATE: {
    SUMMARY: 'Actualizar una categoría',
    DESCRIPTION: 'Actualiza los detalles de una categoría existente',
    EXAMPLE: {
      data: {
        id: '507f1f77bcf86cd799439011',
        name: 'Tecnología e Innovación',
        slug: 'tecnologia-innovacion',
        description: 'Posts sobre tecnología, innovación y tendencias',
        color: '#3B82F6',
        postsCount: 15,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:45:00Z',
      },
      message: 'Categoría actualizada exitosamente',
      success: true,
    },
  },

  DELETE: {
    SUMMARY: 'Eliminar una categoría',
    DESCRIPTION: 'Elimina una categoría del sistema (sin posts asociados)',
    EXAMPLE: {
      data: null,
      message: 'Categoría eliminada exitosamente',
      success: true,
    },
  },

  BULK_CREATE: {
    SUMMARY: 'Crear múltiples categorías',
    DESCRIPTION: 'Crea varias categorías en una sola operación',
    EXAMPLE: {
      data: [
        {
          id: '507f1f77bcf86cd799439011',
          name: 'Tecnología',
          slug: 'tecnologia',
          color: '#3B82F6',
          postsCount: 0,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        },
        {
          id: '507f1f77bcf86cd799439012',
          name: 'Viajes',
          slug: 'viajes',
          color: '#10B981',
          postsCount: 0,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        },
      ],
      message: '2 categorías creadas exitosamente',
      success: true,
    },
  },
};

// Default Categories (seed data)
export const DEFAULT_CATEGORIES = [
  {
    name: 'Tecnología',
    slug: 'tecnologia',
    description: 'Posts sobre tecnología e innovación',
    color: '#3B82F6',
  },
  {
    name: 'Negocios',
    slug: 'negocios',
    description: 'Posts sobre emprendimiento y negocios',
    color: '#F59E0B',
  },
  {
    name: 'Viajes',
    slug: 'viajes',
    description: 'Posts sobre viajes y aventuras',
    color: '#10B981',
  },
  {
    name: 'Estilo de vida',
    slug: 'estilo-de-vida',
    description: 'Posts sobre estilo de vida y bienestar',
    color: '#EC4899',
  },
  {
    name: 'Educación',
    slug: 'educacion',
    description: 'Posts sobre educación y aprendizaje',
    color: '#8B5CF6',
  },
];

// Pagination Defaults
export const CATEGORY_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Color Presets
export const CATEGORY_COLOR_PRESETS = [
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#EC4899', // Pink
  '#8B5CF6', // Violet
  '#EF4444', // Red
  '#F97316', // Orange
  '#06B6D4', // Cyan
];
