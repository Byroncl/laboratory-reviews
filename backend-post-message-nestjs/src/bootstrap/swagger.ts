import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import {
  API_DOCS_PATH,
  API_PREFIX,
  API_VERSION,
} from '../app/core/constants/api.constants';

export const setupSwagger = (app: INestApplication, name: string): void => {
  const config = new DocumentBuilder()
    .setTitle('Post Message API')
    .setDescription('REST API for managing posts, comments, users, clients, roles, and permissions')
    .setVersion(`v${API_VERSION.V1}`)
    .addServer('http://localhost:3000', 'Local development')
    .addServer('http://host.docker.internal:3000', 'Docker development')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Use Scalar for API documentation instead of Swagger
  app.use(
    `/${API_PREFIX}/${API_DOCS_PATH}`,
    apiReference({
      spec: {
        content: document,
      },
      pageTitle: 'Post Message API - Scalar',
      theme: 'moon',
    }),
  );
};

export const getDocsUrl = (host: string, port: number): string =>
  `http://${host}:${port}/${API_PREFIX}/${API_DOCS_PATH}`;
