import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { I18nService } from '../../core/i18n/i18n.service';

@ApiTags('i18n')
@ApiHeader({
  name: 'Accept-Language',
  description: 'Language preference: en (English) or es (Spanish)',
  required: false,
  example: 'es',
})
@Controller('i18n')
export class I18nController {
  constructor(private readonly i18n: I18nService) {}

  @ApiOperation({ summary: 'Get the current detected language' })
  @ApiResponse({ status: 200, description: 'Current language' })
  @Get('current')
  getCurrentLanguage(): { language: string } {
    return { language: this.i18n.getLanguage() };
  }

  @ApiOperation({ summary: 'Get list of supported languages' })
  @ApiResponse({ status: 200, description: 'Supported languages and current' })
  @Get('supported')
  getSupportedLanguages(): { supported: string[]; current: string } {
    return {
      supported: ['en', 'es'],
      current: this.i18n.getLanguage(),
    };
  }
}
