import { ApiProperty } from '@nestjs/swagger';

export class FileResponseDto {
  @ApiProperty({
    example: 'http://localhost:9000/posts/1718000000000-photo.jpg',
    description: 'Public URL of the uploaded image',
  })
  url: string;

  @ApiProperty({
    example: '1718000000000-photo.jpg',
    description: 'Unique filename stored in MinIO',
  })
  filename: string;
}
