import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { TranslationService } from '../utils/translation.service';
import { SupportedLanguage } from '../i18n/locales';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly translationService: TranslationService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const rawLang = (request.headers['accept-language'] as string)
      ?.split(',')[0]
      ?.split('-')[0]
      ?.toLowerCase();
    const lang: SupportedLanguage =
      rawLang === 'es' || rawLang === 'en' ? rawLang : 'en';

    let statusCode: number;
    let message: string;
    let errors: unknown = undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'object' && errorResponse !== null) {
        const i18nKey = (errorResponse as Record<string, unknown>)['i18nKey'];
        if (i18nKey && typeof i18nKey === 'string') {
          message = this.translationService.translate(i18nKey, lang);
        } else if ('message' in errorResponse) {
          message = (errorResponse as Record<string, unknown>)['message'] as string;
        } else {
          message = exception.message;
        }
        errors = (errorResponse as Record<string, unknown>)['errors'];
      } else {
        message = exception.message;
      }
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = this.translationService.translate('common.internal_error', lang);
    }

    response.status(statusCode).json({
      statusCode,
      message,
      ...(errors !== undefined && { errors }),
      timestamp: new Date().toISOString(),
      path: request.url,
      success: false,
    });
  }
}
