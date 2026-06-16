import { INestApplication } from '@nestjs/common';
import {
  CORS_ALLOWED_HEADERS_PROD,
  CORS_METHODS,
  NODE_ENV,
} from '../app/core/constants/cors.constants';

export const setupCors = (app: INestApplication): void => {
  const isProd = process.env.NODE_ENV === NODE_ENV.PRODUCTION;

  const allowedOrigins = isProd
    ? [
        'https://albatrosfrontend.quetsana.com',
        'https://albatrosbackend.quetsana.com',
      ]
    : [
        'http://localhost:3024',
        'http://localhost:3025',
        'http://localhost:4200',
        'http://127.0.0.1:3024',
        'http://127.0.0.1:3025',
      ];

  app.enableCors({
    origin: allowedOrigins,
    methods: [...CORS_METHODS],
    allowedHeaders: isProd ? [...CORS_ALLOWED_HEADERS_PROD] : '*',
    credentials: true,
  });
};
