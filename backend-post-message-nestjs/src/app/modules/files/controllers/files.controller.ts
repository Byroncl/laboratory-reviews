import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload an image file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    type: FileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  async upload(
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
  ) {
    const result = await this.filesService.uploadImage(file);
    return ApiRes.success(result, 'Image uploaded successfully');
  }
}
