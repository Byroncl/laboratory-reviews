// Client Validation Rules
export const CLIENT_VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  LASTNAME_MIN_LENGTH: 2,
  LASTNAME_MAX_LENGTH: 50,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  EMAIL_MAX_LENGTH: 255,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 200,
  TYPE_MIN_LENGTH: 2,
  TYPE_MAX_LENGTH: 50,
};

// Client Messages (i18n keys)
export const CLIENT_MESSAGES = {
  CREATED: 'clients.created',
  UPDATED: 'clients.updated',
  DELETED: 'clients.deleted',
  NOT_FOUND: 'clients.not_found',
  ACCESS_DENIED: 'clients.access_denied',
};

// Client Validation Messages (i18n keys)
export const CLIENT_VALIDATION_MESSAGES = {
  // Name
  NAME_STRING: 'clients.validation_name_string',
  NAME_REQUIRED: 'clients.validation_name_required',
  NAME_MIN_LENGTH: 'clients.validation_name_minLength',
  NAME_MAX_LENGTH: 'clients.validation_name_maxLength',
  NAME_PATTERN: 'clients.validation_name_pattern',

  // Lastname
  LASTNAME_STRING: 'clients.validation_lastname_string',
  LASTNAME_REQUIRED: 'clients.validation_lastname_required',
  LASTNAME_MIN_LENGTH: 'clients.validation_lastname_minLength',
  LASTNAME_MAX_LENGTH: 'clients.validation_lastname_maxLength',
  LASTNAME_PATTERN: 'clients.validation_lastname_pattern',

  // Username
  USERNAME_STRING: 'clients.validation_username_string',
  USERNAME_REQUIRED: 'clients.validation_username_required',
  USERNAME_MIN_LENGTH: 'clients.validation_username_minLength',
  USERNAME_MAX_LENGTH: 'clients.validation_username_maxLength',
  USERNAME_ALPHANUMERIC: 'clients.validation_username_alphanumeric',

  // Email
  EMAIL_INVALID: 'clients.validation_email_invalid',
  EMAIL_REQUIRED: 'clients.validation_email_required',
  EMAIL_MAX_LENGTH: 'clients.validation_email_maxLength',

  // Password
  PASSWORD_STRING: 'clients.validation_password_string',
  PASSWORD_REQUIRED: 'clients.validation_password_required',
  PASSWORD_MIN_LENGTH: 'clients.validation_password_minLength',
  PASSWORD_MAX_LENGTH: 'clients.validation_password_maxLength',

  // Type
  TYPE_STRING: 'clients.validation_type_string',
  TYPE_REQUIRED: 'clients.validation_type_required',
  TYPE_MIN_LENGTH: 'clients.validation_type_minLength',
  TYPE_MAX_LENGTH: 'clients.validation_type_maxLength',
};

// Swagger Documentation
export const CLIENT_SWAGGER = {
  CREATE: {
    summary: 'Create a new client',
    description: 'Creates a new client account with provided information',
  },
  GET_PROFILE: {
    summary: 'Get my profile (client or admin)',
    description: 'Retrieves the authenticated client or admin profile',
  },
  UPDATE_PROFILE: {
    summary: 'Update my profile (client or admin)',
    description: 'Updates the authenticated client or admin profile',
  },
  GET_ALL: {
    summary: 'Get all clients',
    description: 'Retrieves a list of all clients (admin only)',
  },
  GET_ONE: {
    summary: 'Get a client by ID',
    description: 'Retrieves a specific client by their ID',
  },
  UPDATE: {
    summary: 'Update a client',
    description: 'Updates a specific client by their ID (admin only)',
  },
  DELETE: {
    summary: 'Delete a client',
    description: 'Deletes a specific client by their ID (admin only)',
  },
};

// API Response Descriptions
export const CLIENT_RESPONSE_DESCRIPTIONS = {
  CREATED: 'Client created successfully',
  PROFILE: 'Client profile',
  UPDATED: 'Client updated successfully',
  LIST: 'List of clients',
  FOUND: 'Client found',
  DELETED: 'Client deleted successfully',
  VALIDATION_FAILED: 'Validation failed',
  NOT_FOUND: 'Client not found',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
};

// API Parameter Descriptions
export const CLIENT_PARAM_DESCRIPTIONS = {
  ID: 'Client MongoDB ObjectId',
};

// DTO Field Descriptions
export const CLIENT_DTO_DESCRIPTIONS = {
  // CreateClientDto & UpdateClientDto
  NAME: `First name of the client (${CLIENT_VALIDATION.NAME_MIN_LENGTH}-${CLIENT_VALIDATION.NAME_MAX_LENGTH} characters)`,
  LASTNAME: `Last name of the client (${CLIENT_VALIDATION.LASTNAME_MIN_LENGTH}-${CLIENT_VALIDATION.LASTNAME_MAX_LENGTH} characters)`,
  USERNAME: `Unique username (${CLIENT_VALIDATION.USERNAME_MIN_LENGTH}-${CLIENT_VALIDATION.USERNAME_MAX_LENGTH} alphanumeric characters)`,
  EMAIL: 'Valid email address',
  PASSWORD: `Hashed password (${CLIENT_VALIDATION.PASSWORD_MIN_LENGTH}-${CLIENT_VALIDATION.PASSWORD_MAX_LENGTH} characters)`,
  TYPE: `Client type (${CLIENT_VALIDATION.TYPE_MIN_LENGTH}-${CLIENT_VALIDATION.TYPE_MAX_LENGTH} characters)`,

  // ClientResponseDto
  ID: 'Unique client identifier',
  NAME_RESPONSE: `First name of the client (${CLIENT_VALIDATION.NAME_MIN_LENGTH}-${CLIENT_VALIDATION.NAME_MAX_LENGTH} characters)`,
  LASTNAME_RESPONSE: `Last name of the client (${CLIENT_VALIDATION.LASTNAME_MIN_LENGTH}-${CLIENT_VALIDATION.LASTNAME_MAX_LENGTH} characters)`,
  USERNAME_RESPONSE: `Unique username (${CLIENT_VALIDATION.USERNAME_MIN_LENGTH}-${CLIENT_VALIDATION.USERNAME_MAX_LENGTH} alphanumeric characters)`,
  EMAIL_RESPONSE: 'Valid email address',
  TYPE_RESPONSE: `Client type (${CLIENT_VALIDATION.TYPE_MIN_LENGTH}-${CLIENT_VALIDATION.TYPE_MAX_LENGTH} characters)`,
  IS_ACTIVE: 'Whether the client account is active',
  CREATED_AT: 'Account creation date',
  UPDATED_AT: 'Last update date',
};

// Regex Patterns
export const CLIENT_PATTERNS = {
  NAME_LASTNAME: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/,
};

// Examples
export const CLIENT_EXAMPLES = {
  CREATE_REQUEST: {
    name: 'Jane',
    lastname: 'Smith',
    username: 'janesmith',
    email: 'jane@example.com',
    password_hash: 'hashed_password_here',
    type: 'standard',
  },
};
