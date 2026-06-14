export const AUTH_CONFIG = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 200,
  TOKEN_EXPIRATION: '24h',
  REFRESH_TOKEN_EXPIRATION: '7d',
  PASSWORD_SALT_ROUNDS: 10,
} as const;

export const AUTH_MESSAGES = {
  // Login messages
  LOGIN_SUCCESS: 'auth.login_success',
  LOGIN_INVALID_CREDENTIALS: 'auth.login_invalidCredentials',
  LOGIN_REQUIRED: 'auth.login_required',
  LOGIN_FAILED: 'auth.login_failed',
  TOKEN_GENERATED: 'auth.token_generated',
  TOKEN_INVALID: 'auth.token_invalid',
  TOKEN_EXPIRED: 'auth.token_expired',
  UNAUTHORIZED: 'auth.errors_unauthorized',
  USERNAME_REQUIRED: 'auth.validation_username_required',
  PASSWORD_REQUIRED: 'auth.validation_password_required',
} as const;

export const AUTH_VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 200,
} as const;

export const AUTH_VALIDATION_MESSAGES = {
  // Username validation
  USERNAME_REQUIRED: 'auth.validation_username_required',
  USERNAME_STRING: 'auth.validation_username_mustBeString',
  USERNAME_MIN_LENGTH: 'auth.validation_username_minLength',
  USERNAME_MAX_LENGTH: 'auth.validation_username_maxLength',
  USERNAME_ALPHANUMERIC: 'auth.validation_username_alphanumeric',

  // Password validation
  PASSWORD_REQUIRED: 'auth.validation_password_required',
  PASSWORD_STRING: 'auth.validation_password_mustBeString',
  PASSWORD_MIN_LENGTH: 'auth.validation_password_minLength',
  PASSWORD_MAX_LENGTH: 'auth.validation_password_maxLength',

  // Credentials validation
  INVALID_CREDENTIALS: 'auth.errors_invalidCredentials',
} as const;

export const AUTH_SWAGGER = {
  LOGIN: {
    summary: 'Iniciar sesión',
    description: 'Autentica un usuario con nombre de usuario y contraseña, retorna un JWT token',
  },
  LOGOUT: {
    summary: 'Cerrar sesión',
    description: 'Invalida la sesión actual del usuario',
  },
  REFRESH: {
    summary: 'Renovar token',
    description: 'Obtiene un nuevo JWT token utilizando el refresh token válido',
  },
  VERIFY: {
    summary: 'Verificar token',
    description: 'Valida si el token JWT actual es válido',
  },
};

/**
 * API Response Descriptions
 */
export const AUTH_RESPONSE_DESCRIPTIONS = {
  LOGIN_SUCCESS: 'Login successful, JWT token returned',
  LOGIN_FAILED: 'Login failed, invalid credentials',
  UNAUTHORIZED: 'Unauthorized access',
  TOKEN_INVALID: 'Token is invalid or expired',
  VALIDATION_FAILED: 'Validation failed',
} as const;

/**
 * API Parameter Descriptions
 */
export const AUTH_PARAM_DESCRIPTIONS = {
  USERNAME: 'User login username',
  PASSWORD: 'User login password',
} as const;

export const AUTH_EXAMPLES = {
  LOGIN_REQUEST: {
    username: 'johndoe',
    password: 'mypassword123',
  },
  LOGIN_RESPONSE: {
    access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG5kb2UiLCJzdWIiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJ0eXBlIjoidXNlciIsImlhdCI6MTcwNDAxMjAwMH0.signature',
  },
  ERROR_INVALID_CREDENTIALS: {
    statusCode: 401,
    message: 'Invalid credentials',
    error: 'Unauthorized',
  },
};

/**
 * DTO field descriptions for Swagger
 */
export const AUTH_DTO_DESCRIPTIONS = {
  ACCESS_TOKEN: 'JWT access token for authentication in subsequent requests',
  ACCESS_TOKEN_FORMAT: 'Bearer token format',
  USERNAME: `Username (alphanumeric, ${AUTH_CONFIG.USERNAME_MIN_LENGTH}-${AUTH_CONFIG.USERNAME_MAX_LENGTH} characters)`,
  PASSWORD: `Password (${AUTH_CONFIG.PASSWORD_MIN_LENGTH}-${AUTH_CONFIG.PASSWORD_MAX_LENGTH} characters)`,
} as const;

/**
 * User roles
 */
export const AUTH_ROLES = {
  USER: 'user',
  CLIENT: 'client',
  ADMIN: 'admin',
} as const;
