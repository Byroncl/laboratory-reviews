import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { GlobalExceptionFilter } from './app/core/filters/global-exception.filter';
import { TranslationService } from './app/core/utils/translation.service';
import { loadEnv } from './bootstrap/load-env';
import { setupCors } from './bootstrap/cors';
import { getDocsUrl, setupSwagger } from './bootstrap/swagger';
import { checkDatabase } from './bootstrap/check-database';
import { printBanner } from './bootstrap/banner';
import { seedDatabase } from './bootstrap/seed';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  loadEnv();

  // Run seed before creating the HTTP app (uses its own app context)
  if (process.env.SEED_ENABLED === 'true') {
    await seedDatabase();
  }

  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  const host = process.env.HOST ?? (process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost');
  const port = parseInt(process.env.PORT ?? '3000', 10);
  const name = process.env.APP_NAME ?? 'My App';
  const env = process.env.NODE_ENV ?? 'development';

  // Global API prefix - must be set before setupSwagger
  app.setGlobalPrefix('api');

  setupCors(app);
  setupSwagger(app, name);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter(app.get(TranslationService)));
  await app.listen(port, host);

  const dbOk = await checkDatabase(process.env.MONGODB_URI ?? 'mongodb://localhost:27017');
  const url = `http://${host}:${port}`;
  const testingEnabled = process.env.TESTING === 'true';
  const storageOk = process.env.MINIO_ENDPOINT ? true : false;

  printBanner({
    name,
    env,
    url,
    docs: getDocsUrl(host, port),
    dbOk,
    storageUrl: process.env.MINIO_ENDPOINT ?? 'N/A',
    storageOk,
    testing: testingEnabled,
  });

  logger.log(`✓ ${name} running on ${url}`);
  logger.log(`✓ API Docs: ${getDocsUrl(host, port)}`);
  logger.log('✓ Ready to accept requests...\n');
}
bootstrap();
