import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { FilesService } from './files.service';

jest.mock('../../../core/config/minio.config', () => ({
  createMinioClient: jest.fn(),
  MINIO_BUCKET: 'posts',
}));

import { createMinioClient } from '../../../core/config/minio.config';

describe('FilesService', () => {
  let service: FilesService;
  let mockMinioClient: {
    bucketExists: jest.Mock;
    makeBucket: jest.Mock;
    putObject: jest.Mock;
    removeObject: jest.Mock;
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'photo.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('fake-image-content'),
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  };

  beforeEach(async () => {
    mockMinioClient = {
      bucketExists: jest.fn().mockResolvedValue(true),
      makeBucket: jest.fn().mockResolvedValue(undefined),
      putObject: jest.fn().mockResolvedValue(undefined),
      removeObject: jest.fn().mockResolvedValue(undefined),
    };

    (createMinioClient as jest.Mock).mockReturnValue(mockMinioClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesService],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should upload an image and return url and filename', async () => {
      const result = await service.uploadImage(mockFile);

      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('filename');
      expect(result.filename).toMatch(/\.jpg$/);
      expect(result.url).toContain(result.filename);
      expect(mockMinioClient.putObject).toHaveBeenCalledWith(
        'posts',
        result.filename,
        mockFile.buffer,
        mockFile.size,
        { 'Content-Type': 'image/jpeg' },
      );
    });

    it('should create the bucket if it does not exist', async () => {
      mockMinioClient.bucketExists.mockResolvedValue(false);

      await service.uploadImage(mockFile);

      expect(mockMinioClient.makeBucket).toHaveBeenCalledWith('posts', 'us-east-1');
    });

    it('should throw InternalServerErrorException when putObject fails', async () => {
      mockMinioClient.putObject.mockRejectedValue(new Error('Connection refused'));

      await expect(service.uploadImage(mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException when bucket check fails', async () => {
      mockMinioClient.bucketExists.mockRejectedValue(new Error('MinIO unavailable'));

      await expect(service.uploadImage(mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('deleteImage', () => {
    it('should delete an image by filename', async () => {
      await service.deleteImage('1718000000000-abc.jpg');

      expect(mockMinioClient.removeObject).toHaveBeenCalledWith(
        'posts',
        '1718000000000-abc.jpg',
      );
    });

    it('should not throw when image is not found (swallows error)', async () => {
      mockMinioClient.removeObject.mockRejectedValue(new Error('NoSuchKey'));

      await expect(service.deleteImage('nonexistent.jpg')).resolves.not.toThrow();
    });
  });

  describe('getImageUrl', () => {
    it('should return the correct public URL for a filename', () => {
      const url = service.getImageUrl('1718000000000-abc.jpg');

      expect(url).toContain('1718000000000-abc.jpg');
      expect(url).toContain('posts');
      expect(url).toMatch(/^http/);
    });
  });
});
