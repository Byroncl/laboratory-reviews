import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { FILE_CONFIG } from '../constants/file.constants';
import { TranslationService } from '../utils/translation.service';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private readonly i18n: TranslationService) {}

  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException(this.i18n.translate('validation.required'));
    }

    const isImage = (FILE_CONFIG.ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.mimetype);
    const isAudio = (FILE_CONFIG.ALLOWED_AUDIO_MIME_TYPES as readonly string[]).includes(file.mimetype);

    if (!isImage && !isAudio) {
      const allowed = [...FILE_CONFIG.ALLOWED_IMAGE_MIME_TYPES, ...FILE_CONFIG.ALLOWED_AUDIO_MIME_TYPES];
      throw new BadRequestException(
        `${this.i18n.translate('files.invalid_type')}. Allowed types: ${allowed.join(', ')}`,
      );
    }

    const maxSize = isAudio ? FILE_CONFIG.MAX_AUDIO_SIZE : FILE_CONFIG.MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      throw new BadRequestException(this.i18n.translate('files.too_large'));
    }

    return file;
  }
}
