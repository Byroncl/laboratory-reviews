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

    if (
      !(FILE_CONFIG.ALLOWED_MIME_TYPES as readonly string[]).includes(
        file.mimetype,
      )
    ) {
      throw new BadRequestException(
        `${this.i18n.translate('files.invalid_type')}. Allowed types: ${FILE_CONFIG.ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    if (file.size > FILE_CONFIG.MAX_SIZE) {
      throw new BadRequestException(this.i18n.translate('files.too_large'));
    }

    return file;
  }
}
