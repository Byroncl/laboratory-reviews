import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiResponse } from '../dto/api.response';
import { TranslationService } from '../utils/translation.service';
import { SupportedLanguage } from '../i18n/translations';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly translationService: TranslationService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const rawLang = (request.headers['accept-language'] as string)
      ?.split(',')[0]
      ?.split('-')[0]
      ?.toLowerCase();
    const lang: SupportedLanguage =
      rawLang === 'es' || rawLang === 'en' ? rawLang : 'en';

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : this.translationService.translate('common.internal_error', lang);

    response.status(status).json(ApiResponse.error(message, status));
  }
}
