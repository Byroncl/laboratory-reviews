export const HOME_ROUTES = {
  ROOT: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  POST_DETAIL: (id: string): string[] => ['/posts', id],
} as const;
