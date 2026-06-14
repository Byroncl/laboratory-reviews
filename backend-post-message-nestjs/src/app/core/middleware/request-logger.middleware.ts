import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip, headers } = req;
    const contentType = headers['content-type'];
    const authorization = headers['authorization'] ? '✓ Present' : '✗ Missing';

    const start = Date.now();

    // Log incoming request
    this.logger.log(
      `→ [${method.toUpperCase()}] ${originalUrl} | Auth: ${authorization} | Content-Type: ${contentType || 'N/A'} | IP: ${ip}`,
    );

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      const statusLabel = statusCode >= 200 && statusCode < 300 ? '✓' : statusCode >= 400 ? '✗' : '→';

      this.logger.log(
        `${statusLabel} [${method.toUpperCase()}] ${originalUrl} | ${statusCode} | ${duration}ms`,
      );
    });

    next();
  }
}
