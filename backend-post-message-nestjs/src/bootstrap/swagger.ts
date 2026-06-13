import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { Application } from 'express';
import {
  API_DOCS_PATH,
  API_PREFIX,
  API_VERSION,
} from '../app/core/constants/api.constants';

export const setupSwagger = (app: INestApplication, name: string): void => {
  const config = new DocumentBuilder()
    .setTitle(name)
    .setVersion(`v${API_VERSION.V1}`)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const expressApp = app.getHttpAdapter().getInstance() as Application;

  expressApp.use(
    `/${API_PREFIX}/${API_DOCS_PATH}`,
    apiReference({ content: document }),
  );
};

export const getDocsUrl = (host: string, port: number): string =>
  `http://${host}:${port}/${API_PREFIX}/${API_DOCS_PATH}`;
