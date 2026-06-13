import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { AUDIT_KEY, AuditActionOptions } from '../decorators/audit-action.decorator';
import { AuditService } from '../../modules/audit/services/audit.service';
import { EntityType } from '../../modules/audit/schemas/audit-log.schema';

const noop = () => undefined;

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.getAllAndOverride<AuditActionOptions | undefined>(
      AUDIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No metadata or explicitly skipped — pass through
    if (!meta || meta.skipAudit) {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request & { user?: { userId?: string; username?: string } }>();
    const res = http.getResponse<Response>();

    const httpMethod = req.method;
    const path = req.originalUrl ?? req.url;
    const ip =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
      req.socket?.remoteAddress ??
      'unknown';

    // Extract entity ID from route params for snapshot pre-fetch
    const routeId =
      (req.params as Record<string, string>)?.['id'] ??
      (req.params as Record<string, string>)?.['entityId'];

    let beforeSnapshot: Record<string, unknown> | null = null;

    // Pre-fetch snapshot if requested (synchronous part before handler)
    const capturePromise: Promise<void> =
      meta.captureSnapshot && routeId
        ? this.auditService
            .snapshotEntity(meta.entity as EntityType, routeId)
            .then((snap) => {
              beforeSnapshot = snap;
            })
            .catch(noop)
        : Promise.resolve();

    return new Observable((subscriber) => {
      capturePromise.then(() => {
        next
          .handle()
          .pipe(
            tap((responseBody) => {
              const statusCode = res.statusCode ?? 200;

              // Only log on successful responses (2xx)
              if (statusCode < 200 || statusCode >= 300) return;

              // Extract userId/username from request.user (populated by AuthGuard)
              // For LOGIN/LOGOUT, user may come from the response JWT body
              let userId = req.user?.userId ?? '';
              let username = req.user?.username ?? '';

              if (!userId && responseBody) {
                // LOGIN response: JWT claims in response body (access_token decoded or direct payload)
                const body = responseBody as Record<string, unknown>;
                const nested = (body['data'] as Record<string, unknown>) ?? body;
                userId = (nested['userId'] as string) ?? (nested['sub'] as string) ?? '';
                username = (nested['username'] as string) ?? '';
              }

              // Entity ID fallback chain
              const entityId = this.extractEntityId(req, responseBody, meta.metadata);

              // After snapshot — extract from response body
              let afterSnapshot: Record<string, unknown> | undefined;
              if (meta.captureSnapshot && responseBody) {
                const body = responseBody as Record<string, unknown>;
                afterSnapshot = ((body['data'] as Record<string, unknown>) ?? body) as Record<
                  string,
                  unknown
                >;
              }

              this.auditService.log({
                userId,
                username,
                action: meta.action,
                entityType: meta.entity as EntityType,
                entityId: entityId ?? undefined,
                httpMethod,
                path,
                ip,
                statusCode,
                before: beforeSnapshot ?? undefined,
                after: afterSnapshot,
                metadata: meta.metadata,
              });
            }),
          )
          .subscribe({
            next: (v) => subscriber.next(v),
            error: (e) => subscriber.error(e),
            complete: () => subscriber.complete(),
          });
      });
    });
  }

  private extractEntityId(
    req: Request & { params?: Record<string, string> },
    responseBody: unknown,
    decoratorMetadata?: Record<string, unknown>,
  ): string | null {
    // 1. Route param :id
    const paramId = (req.params as Record<string, string>)?.['id'];
    if (paramId) return paramId;

    // 2. Response body _id or data._id
    if (responseBody) {
      const body = responseBody as Record<string, unknown>;
      const direct = body['_id'] as string | undefined;
      if (direct) return direct;
      const nested = body['data'] as Record<string, unknown> | undefined;
      if (nested?.['_id']) return nested['_id'] as string;
    }

    // 3. Decorator-supplied hint
    if (decoratorMetadata?.['entityIdHint']) {
      return decoratorMetadata['entityIdHint'] as string;
    }

    return null;
  }
}
