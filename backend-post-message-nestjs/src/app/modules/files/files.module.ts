import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FilesController } from './controllers/files.controller';
import { FilesService } from './services/files.service';
import { TranslationService } from '../../core/utils/translation.service';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService, TranslationService],
  exports: [FilesService, TranslationService],
})
export class FilesModule {}
