import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
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

    // No metadata or explicitly skipped — pass through without any overhead
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

    // Route param used for snapshot pre-fetch
    const rawRouteId = (req.params as Record<string, string | string[]>)?.['id'];
    const routeId = Array.isArray(rawRouteId) ? rawRouteId[0] : rawRouteId;

    // Pre-fetch snapshot before forwarding to handler (only for UPDATE with captureSnapshot)
    const capturePromise: Promise<Record<string, unknown> | null> =
      meta.captureSnapshot && routeId
        ? this.auditService.snapshotEntity(meta.entity as EntityType, routeId).catch(() => null)
        : Promise.resolve(null);

    return from(capturePromise).pipe(
      switchMap((beforeSnapshot) =>
        next.handle().pipe(
          tap((responseBody) => {
            const statusCode = res.statusCode ?? 200;

            // Only log on successful responses (2xx)
            if (statusCode < 200 || statusCode >= 300) return;

            // Extract userId/username from request.user (set by AuthGuard)
            // For LOGIN, user may be absent from request — fall back to response JWT body
            let userId = req.user?.userId ?? '';
            let username = req.user?.username ?? '';

            if (!userId && responseBody) {
              const body = responseBody as Record<string, unknown>;
              const nested = (body['data'] as Record<string, unknown>) ?? body;
              userId = (nested['userId'] as string) ?? (nested['sub'] as string) ?? '';
              username = (nested['username'] as string) ?? '';
            }

            // Entity ID extraction fallback chain
            const entityId = this.extractEntityId(req as Request, responseBody, meta.metadata);

            // After-snapshot: entity state from response body (for UPDATE diff)
            let afterSnapshot: Record<string, unknown> | undefined;
            if (meta.captureSnapshot && responseBody) {
              const body = responseBody as Record<string, unknown>;
              afterSnapshot = ((body['data'] as Record<string, unknown>) ?? body) as Record<
                string,
                unknown
              >;
            }

            // Fire-and-forget — never awaited, never blocks response
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
        ),
      ),
    );
  }

  private extractEntityId(
    req: Request,
    responseBody: unknown,
    decoratorMetadata?: Record<string, unknown>,
  ): string | null {
    // 1. Route param :id
    const params = req.params as Record<string, string | string[]>;
    const rawParamId = params?.['id'];
    const paramId = Array.isArray(rawParamId) ? rawParamId[0] : rawParamId;
    if (paramId) return paramId;

    // 2. Response body _id or data._id (CREATE response)
    if (responseBody) {
      const body = responseBody as Record<string, unknown>;
      const direct = body['_id'] as string | undefined;
      if (direct) return direct;
      const nested = body['data'] as Record<string, unknown> | undefined;
      if (nested?.['_id']) return String(nested['_id']);
    }

    // 3. Decorator-supplied hint (escape hatch for sub-resource routes)
    if (decoratorMetadata?.['entityIdHint']) {
      return decoratorMetadata['entityIdHint'] as string;
    }

    return null;
  }
}
