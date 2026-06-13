import { INestApplication } from '@nestjs/common';
import {
  CORS_ALLOWED_HEADERS_PROD,
  CORS_METHODS,
  NODE_ENV,
} from '../app/core/constants/cors.constants';

export const setupCors = (app: INestApplication): void => {
  const isProd = process.env.NODE_ENV === NODE_ENV.PRODUCTION;

  app.enableCors({
    origin: true,
    methods: [...CORS_METHODS],
    allowedHeaders: isProd ? [...CORS_ALLOWED_HEADERS_PROD] : '*',
    credentials: true,
  });
};
