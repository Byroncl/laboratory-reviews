import { Injectable } from '@nestjs/common';
import { TRANSLATIONS, SupportedLanguage } from './translations';

@Injectable()
export class TranslationService {
  private currentLanguage: SupportedLanguage = 'en';

  setLanguage(lang: SupportedLanguage): void {
    this.currentLanguage = lang;
  }

  translate(key: string, lang?: SupportedLanguage, ...args: string[]): string {
    const language = lang ?? this.currentLanguage;
    const translations = TRANSLATIONS[language] ?? TRANSLATIONS['en'];

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
