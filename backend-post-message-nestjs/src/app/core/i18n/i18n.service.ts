import { Injectable, Inject, Optional } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { TRANSLATIONS, SupportedLanguage } from './locales';

@Injectable()
export class I18nService {
  constructor(@Optional() @Inject(REQUEST) private request?: Request) {}

  private getLanguageFromRequest(): SupportedLanguage {
    if (this.request) {
      const lang = (this.request.headers['accept-language'] as string)
        ?.split(',')[0]
        ?.split('-')[0]
        ?.toLowerCase();

      if (lang === 'es' || lang === 'en') {
        return lang as SupportedLanguage;
      }
    }

    return 'en';
  }

  translate(key: string, ...args: string[]): string {
    const language = this.getLanguageFromRequest();
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

  getLanguage(): SupportedLanguage {
    return this.getLanguageFromRequest();
  }
}
