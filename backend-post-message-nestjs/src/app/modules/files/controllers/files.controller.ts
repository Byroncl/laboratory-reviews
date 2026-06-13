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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FilesService } from '../services/files.service';
import { FileValidationPipe } from '../../../core/pipes/file-validation.pipe';
import { FileResponseDto } from '../dto/file-response.dto';
import { UploadFileDto } from '../dto/upload-file.dto';
import { ApiResponse as ApiRes } from '../../../core/dto/api.response';
import { TranslationService } from '../../../core/utils/translation.service';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly i18n: TranslationService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a single image or audio file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: FileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  async upload(
    @UploadedFile(new FileValidationPipe(new TranslationService())) file: Express.Multer.File,
  ) {
    const result = await this.filesService.uploadImage(file);
    return ApiRes.success(result, this.i18n.translate('files.uploaded'));
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Upload multiple media files (images and audios)' })
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
  @ApiResponse({
    status: 201,
    description: 'Files uploaded successfully',
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
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const results = await Promise.all(
      files.map((file) => this.filesService.uploadImage(file)),
    );
    return ApiRes.success(results, this.i18n.translate('files.uploaded'));
  }
}
