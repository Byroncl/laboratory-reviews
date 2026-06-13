import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        if (data !== null && typeof data === 'object' && 'success' in data) {
          return data;
        }

        const statusCode =
          context.switchToHttp().getResponse<{ statusCode?: number }>()
            .statusCode ?? 200;

        return {
          statusCode,
          data,
          timestamp: new Date().toISOString(),
          success: true,
        };
      }),
    );
  }
}
