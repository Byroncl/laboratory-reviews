import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file to upload (JPEG, PNG, GIF, WebP — max 5MB)',
  })
  file: Express.Multer.File;
}
