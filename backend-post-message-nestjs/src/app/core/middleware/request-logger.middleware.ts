import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'];
    const contentType = headers['content-type'];
    const authorization = headers['authorization'] ? '✓ Present' : '✗ Missing';

    const start = Date.now();

    // Log incoming request
    const logColor = this.getColorForMethod(method);
    this.logger.log(
      `\n${logColor}→ ${method.padEnd(6)} ${originalUrl}\n` +
        `  IP: ${ip}\n` +
        `  Auth: ${authorization}\n` +
        `  Content-Type: ${contentType || 'N/A'}`,
    );

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      const statusColor = this.getColorForStatus(statusCode);

      this.logger.log(
        `${statusColor}← ${method.padEnd(6)} ${originalUrl}\n` +
          `  Status: ${statusCode} | Duration: ${duration}ms | IP: ${ip}`,
      );
    });

    next();
  }

  private getColorForMethod(method: string): string {
    const colors: Record<string, string> = {
      GET: '\x1b[36m',     // Cyan
      POST: '\x1b[32m',    // Green
      PUT: '\x1b[33m',     // Yellow
      PATCH: '\x1b[35m',   // Magenta
      DELETE: '\x1b[31m',  // Red
    };
    return colors[method] || '\x1b[37m';
  }

  private getColorForStatus(status: number): string {
    if (status >= 200 && status < 300) return '\x1b[32m'; // Green
    if (status >= 300 && status < 400) return '\x1b[36m'; // Cyan
    if (status >= 400 && status < 500) return '\x1b[33m'; // Yellow
    return '\x1b[31m'; // Red
  }
}
