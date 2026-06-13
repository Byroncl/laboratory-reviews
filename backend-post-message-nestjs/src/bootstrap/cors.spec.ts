import { setupCors } from './cors';
import {
  CORS_ALLOWED_HEADERS_PROD,
  CORS_METHODS,
  NODE_ENV,
} from '../app/core/constants/cors.constants';
import { INestApplication } from '@nestjs/common';

function createMockApp(): { enableCors: jest.Mock } & INestApplication {
  return { enableCors: jest.fn() } as unknown as {
    enableCors: jest.Mock;
  } & INestApplication;
}

describe('setupCors', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should call enableCors with origin:true and credentials:true', () => {
    process.env.NODE_ENV = 'development';
    const app = createMockApp();

    setupCors(app);

    expect(app.enableCors).toHaveBeenCalledWith(
      expect.objectContaining({ origin: true, credentials: true }),
    );
  });

  it('should include all HTTP methods', () => {
    process.env.NODE_ENV = 'development';
    const app = createMockApp();

    setupCors(app);

    const [config] = app.enableCors.mock.calls[0] as [
      Parameters<INestApplication['enableCors']>[0],
    ];
    expect(config.methods).toEqual([...CORS_METHODS]);
  });

  it('should use wildcard allowedHeaders in non-production', () => {
    process.env.NODE_ENV = 'development';
    const app = createMockApp();

    setupCors(app);

    const [config] = app.enableCors.mock.calls[0] as [
      Parameters<INestApplication['enableCors']>[0],
    ];
    expect(config.allowedHeaders).toBe('*');
  });

  it('should use restricted allowedHeaders in production', () => {
    process.env.NODE_ENV = NODE_ENV.PRODUCTION;
    const app = createMockApp();

    setupCors(app);

    const [config] = app.enableCors.mock.calls[0] as [
      Parameters<INestApplication['enableCors']>[0],
    ];
    expect(config.allowedHeaders).toEqual([...CORS_ALLOWED_HEADERS_PROD]);
  });

  it('should use wildcard allowedHeaders when NODE_ENV is undefined', () => {
    delete process.env.NODE_ENV;
    const app = createMockApp();

    setupCors(app);

    const [config] = app.enableCors.mock.calls[0] as [
      Parameters<INestApplication['enableCors']>[0],
    ];
    expect(config.allowedHeaders).toBe('*');
  });
});

describe('cors constants', () => {
  it('CORS_METHODS should contain standard HTTP methods', () => {
    expect(CORS_METHODS).toContain('GET');
    expect(CORS_METHODS).toContain('POST');
    expect(CORS_METHODS).toContain('PUT');
    expect(CORS_METHODS).toContain('PATCH');
    expect(CORS_METHODS).toContain('DELETE');
    expect(CORS_METHODS).toContain('OPTIONS');
  });

  it('CORS_ALLOWED_HEADERS_PROD should include Content-Type and Authorization', () => {
    expect(CORS_ALLOWED_HEADERS_PROD).toContain('Content-Type');
    expect(CORS_ALLOWED_HEADERS_PROD).toContain('Authorization');
  });

  it('NODE_ENV.PRODUCTION should equal "production"', () => {
    expect(NODE_ENV.PRODUCTION).toBe('production');
  });
});
