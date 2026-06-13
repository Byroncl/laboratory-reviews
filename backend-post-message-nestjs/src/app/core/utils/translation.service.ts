import { Injectable } from '@nestjs/common';
import { TRANSLATIONS, SupportedLanguage } from '../i18n/locales';

/**
 * TranslationService — thin wrapper kept here for backward-compatible imports.
 * New code should import from core/i18n/i18n.service instead.
 */
@Injectable()
export class TranslationService {
  private currentLanguage: SupportedLanguage = 'en';

  setLanguage(lang: SupportedLanguage): void {
    this.currentLanguage = lang;
  }

  translate(key: string, lang?: string, ...args: string[]): string {
    const language = (lang as SupportedLanguage) ?? this.currentLanguage;
    const translations =
      TRANSLATIONS[language] ?? TRANSLATIONS['en'];

    const keys = key.split('.');
    let value: unknown = translations;

    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }

    if (typeof value !== 'string') return key;

    return args.reduce(
      (str, arg, idx) => str.replace(`{${idx}}`, arg),
      value,
    );
  }
}
