import { EN_TRANSLATIONS } from './en.translations';
import { ES_TRANSLATIONS } from './es.translations';

export type SupportedLanguage = 'en' | 'es';

export const TRANSLATIONS: Record<SupportedLanguage, typeof EN_TRANSLATIONS> = {
  en: EN_TRANSLATIONS,
  es: ES_TRANSLATIONS as unknown as typeof EN_TRANSLATIONS,
};
