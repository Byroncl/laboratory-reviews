export const PROFILE_FORM_FIELDS = {
  NAME: 'name',
  LASTNAME: 'lastname',
  EMAIL: 'email',
  USERNAME: 'username',
  PHONE: 'phone',
  BIO: 'bio',
} as const;

export const PASSWORD_FORM_FIELDS = {
  CURRENT: 'currentPassword',
  NEW: 'newPassword',
  CONFIRM: 'confirmPassword',
} as const;

export const PROFILE_MESSAGES = {
  LOADED: 'Perfil cargado exitosamente',
  UPDATED: 'Perfil actualizado exitosamente',
  PASSWORD_CHANGED: 'Contraseña cambiada exitosamente',
  UNAUTHORIZED: 'No autorizado para acceder a este perfil',
  ERROR_LOADING: 'Error al cargar el perfil',
  ERROR_UPDATING: 'Error al actualizar el perfil',
  ERROR_CHANGING_PASSWORD: 'Error al cambiar la contraseña',
} as const;
