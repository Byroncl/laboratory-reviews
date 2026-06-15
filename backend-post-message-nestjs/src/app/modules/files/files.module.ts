import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FilesController } from './controllers/files.controller';
import { FilesService } from './services/files.service';
import { TranslationService } from '../../core/utils/translation.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { FileRepository } from './domain/repositories/file.repository';
import { FileMinioRepository } from './infrastructure/repositories/file-minio.repository';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [FilesController],
  providers: [
    FilesService,
    TranslationService,
    I18nService,
    {
      provide: FileRepository,
      useClass: FileMinioRepository,
    },
  ],
  exports: [FilesService, TranslationService],
})
export class FilesModule {}
