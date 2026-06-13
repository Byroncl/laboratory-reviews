import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { GlobalExceptionFilter } from './app/core/filters/global-exception.filter';
import { TranslationService } from './app/core/utils/translation.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter(app.get(TranslationService)));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
