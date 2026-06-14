import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse as ApiResDecorator,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { FilesService } from '../services/files.service';
import { FileValidationPipe } from '../../../core/pipes/file-validation.pipe';
import { FileResponseDto } from '../dto/file-response.dto';
import { UploadFileDto } from '../dto/upload-file.dto';
import { ApiResponse as ApiRes } from '../../../core/dto/api.response';
import { I18nService } from '../../../core/i18n/i18n.service';
import {
  FILES_SWAGGER,
  FILES_RESPONSE_DESCRIPTIONS,
  FILES_MESSAGES,
} from '../constants/files.constants';

@ApiTags('files')
@ApiHeader({
  name: 'Accept-Language',
  description: 'Language preference: en (English) or es (Spanish)',
  required: false,
  example: 'es',
})
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly i18n: I18nService,
  ) {}

  @ApiOperation(FILES_SWAGGER.UPLOAD_IMAGE)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @ApiResDecorator({
    status: 201,
    description: FILES_RESPONSE_DESCRIPTIONS.UPLOADED,
    type: FileResponseDto,
  })
  @ApiResDecorator({
    status: 400,
    description: FILES_RESPONSE_DESCRIPTIONS.VALIDATION_FAILED,
  })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile(new FileValidationPipe(this.i18n)) file: Express.Multer.File,
  ) {
    const result = await this.filesService.uploadImage(file);
    return ApiRes.success(result, this.i18n.translate(FILES_MESSAGES.UPLOADED));
  }

  @ApiOperation(FILES_SWAGGER.UPLOAD_MULTIPLE)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResDecorator({
    status: 201,
    description: FILES_RESPONSE_DESCRIPTIONS.MULTIPLE_UPLOADED,
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          filename: { type: 'string' },
        },
      },
    },
  })
  @ApiResDecorator({
    status: 400,
    description: FILES_RESPONSE_DESCRIPTIONS.VALIDATION_FAILED,
  })
  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const results = await Promise.all(
      files.map((file) => this.filesService.uploadImage(file)),
    );
    return ApiRes.success(results, this.i18n.translate(FILES_MESSAGES.UPLOADED));
  }
}
