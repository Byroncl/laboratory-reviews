import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Request');

  intercept(context: ExecutionContext, next: any): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, originalUrl, body, query, params } = request;

    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const statusCode = response.statusCode;

        const logData = {
          method,
          url: originalUrl,
          statusCode,
          duration: `${duration}ms`,
        };

        if (Object.keys(query || {}).length > 0) {
          logData['query'] = query;
        }
        if (Object.keys(params || {}).length > 0) {
          logData['params'] = params;
        }
        if (body && Object.keys(body).length > 0) {
          logData['body'] = body;
        }

        this.logger.debug(JSON.stringify(logData, null, 2));
      }),
    );
  }
}
