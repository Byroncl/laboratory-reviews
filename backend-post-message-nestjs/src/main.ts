import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { GlobalExceptionFilter } from './app/core/filters/global-exception.filter';
import { TranslationService } from './app/core/utils/translation.service';
import { loadEnv } from './bootstrap/load-env';
import { setupCors } from './bootstrap/cors';
import { getDocsUrl, setupSwagger } from './bootstrap/swagger';
import { checkDatabase } from './bootstrap/check-database';
import { printBanner } from './bootstrap/banner';

async function bootstrap() {
  loadEnv();
  const app = await NestFactory.create(AppModule);
  const host = process.env.HOST ?? 'localhost';
  const port = parseInt(process.env.PORT, 10) ?? 3000;
  const name = process.env.APP_NAME ?? 'My App';
  const env = process.env.NODE_ENV ?? 'development';

  setupCors(app);
  setupSwagger(app, name);

  app.useGlobalFilters(new GlobalExceptionFilter(app.get(TranslationService)));
  await app.listen(port, host);

  const dbOk = await checkDatabase(process.env.MONGODB_URI);
  const url = `http://${host}:${port}`;

  printBanner({
    name,
    env,
    url,
    docs: getDocsUrl(host, port),
    dbOk,
    storageUrl: 'N/A',
    storageOk: false,
    testing: false,
  });
}
bootstrap();
