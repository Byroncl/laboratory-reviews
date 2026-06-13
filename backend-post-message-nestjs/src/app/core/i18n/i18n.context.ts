export interface I18nContext {
  language: 'en' | 'es';
  user?: { id: string; preferredLanguage?: 'en' | 'es' };
}

export const I18N_CONTEXT = 'I18N_CONTEXT';
