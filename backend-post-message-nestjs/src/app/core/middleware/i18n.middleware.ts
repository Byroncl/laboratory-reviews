import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class I18nMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const acceptLanguage = req.get('accept-language') ?? 'en';
    const lang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();

    (req as Request & { language: string }).language =
      lang === 'es' ? 'es' : 'en';

    res.set('Content-Language', (req as Request & { language: string }).language);

    next();
  }
}
