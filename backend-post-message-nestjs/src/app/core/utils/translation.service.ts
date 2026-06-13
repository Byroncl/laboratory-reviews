import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TranslationService {
  private translations: any;

  constructor() {
    const filePath = path.join(
      process.cwd(),
      'src',
      'config',
      'i18n',
      'response.json',
    );
    this.translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  translate(key: string, lang: string = 'en'): string {
    return this.translations[key]?.[lang] || key;
  }
}
