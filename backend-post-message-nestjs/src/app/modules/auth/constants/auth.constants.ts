export const AUTH_VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 200,
};

export const AUTH_MESSAGES = {
  // Login messages
  LOGIN_SUCCESS: 'auth.login_success',
  LOGIN_INVALID_CREDENTIALS: 'auth.login_invalidCredentials',
  LOGIN_REQUIRED: 'auth.login_required',
  LOGIN_FAILED: 'auth.login_failed',

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

  // Token messages
  TOKEN_GENERATED: 'auth.token_generated',
  TOKEN_INVALID: 'auth.token_invalid',
  TOKEN_EXPIRED: 'auth.token_expired',

  // Auth errors
  INVALID_CREDENTIALS: 'auth.errors_invalidCredentials',
  UNAUTHORIZED: 'auth.errors_unauthorized',
};

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

export const AUTH_DTO_DESCRIPTIONS = {
  ACCESS_TOKEN: 'JWT access token para autenticación en requests posteriores',
  ACCESS_TOKEN_FORMAT: 'Bearer token',
  USERNAME: `Username (alphanumeric, ${AUTH_VALIDATION.USERNAME_MIN_LENGTH}-${AUTH_VALIDATION.USERNAME_MAX_LENGTH} characters)`,
  PASSWORD: `Password (${AUTH_VALIDATION.PASSWORD_MIN_LENGTH}-${AUTH_VALIDATION.PASSWORD_MAX_LENGTH} characters)`,
};

export const AUTH_ROLES = {
  USER: 'user',
  CLIENT: 'client',
  ADMIN: 'admin',
} as const;

export const AUTH_DEFAULTS = {
  TOKEN_EXPIRATION: '24h',
  REFRESH_TOKEN_EXPIRATION: '7d',
  PASSWORD_SALT_ROUNDS: 10,
};
