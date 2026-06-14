import { TransformInterceptor } from './transform.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

function buildContext(statusCode = 200): ExecutionContext {
  return {
    switchToHttp: () => ({
      getResponse: () => ({ statusCode }),
    }),
  } as any;
}

function buildHandler(data: unknown): CallHandler {
  return { handle: () => of(data) };
}

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('should pass through data that already has a success wrapper', (done) => {
    const wrapped = { success: true, data: 'test', statusCode: 200, timestamp: 'ts' };
    const ctx = buildContext(200);
    const handler = buildHandler(wrapped);

    interceptor.intercept(ctx, handler).subscribe((result) => {
      expect(result).toBe(wrapped);
      done();
    });
  });

  it('should wrap plain data that has no success property', (done) => {
    const plain = { id: '1', name: 'John' };
    const ctx = buildContext(200);
    const handler = buildHandler(plain);

    interceptor.intercept(ctx, handler).subscribe((result) => {
      expect((result as any).success).toBe(true);
      expect((result as any).data).toEqual(plain);
      expect((result as any).statusCode).toBe(200);
      expect((result as any).timestamp).toBeDefined();
      done();
    });
  });

  it('should wrap null data', (done) => {
    const ctx = buildContext(200);
    const handler = buildHandler(null);

    interceptor.intercept(ctx, handler).subscribe((result) => {
      expect((result as any).success).toBe(true);
      expect((result as any).data).toBeNull();
      done();
    });
  });

  it('should use the response statusCode for the wrapper', (done) => {
    const ctx = buildContext(201);
    const handler = buildHandler({ id: '1' });

    interceptor.intercept(ctx, handler).subscribe((result) => {
      expect((result as any).statusCode).toBe(201);
      done();
    });
  });
});
