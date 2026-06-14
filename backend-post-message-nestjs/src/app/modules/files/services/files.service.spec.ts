import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { FileRepository } from '../domain/repositories/file.repository';

describe('FilesService', () => {
  let service: FilesService;
  let mockFileRepository: {
    uploadImage: jest.Mock;
    deleteImage: jest.Mock;
    getImageUrl: jest.Mock;
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
    jest.clearAllMocks();

    mockFileRepository = {
      uploadImage: jest.fn(),
      deleteImage: jest.fn().mockResolvedValue(undefined),
      getImageUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: FileRepository, useValue: mockFileRepository },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should delegate to FileRepository.uploadImage and return result', async () => {
      const uploadResult = {
        url: 'http://localhost:9000/posts/1718000000000-abc.jpg',
        filename: '1718000000000-abc.jpg',
      };
      mockFileRepository.uploadImage.mockResolvedValue(uploadResult);

      const result = await service.uploadImage(mockFile);

      expect(result).toEqual(uploadResult);
      expect(mockFileRepository.uploadImage).toHaveBeenCalledWith(mockFile);
    });

    it('should propagate errors from the repository', async () => {
      mockFileRepository.uploadImage.mockRejectedValue(new Error('Upload failed'));

      await expect(service.uploadImage(mockFile)).rejects.toThrow('Upload failed');
    });
  });

  describe('deleteImage', () => {
    it('should delegate to FileRepository.deleteImage', async () => {
      await service.deleteImage('1718000000000-abc.jpg');

      expect(mockFileRepository.deleteImage).toHaveBeenCalledWith('1718000000000-abc.jpg');
    });
  });

  describe('getImageUrl', () => {
    it('should delegate to FileRepository.getImageUrl and return the url', () => {
      mockFileRepository.getImageUrl.mockReturnValue(
        'http://localhost:9000/posts/1718000000000-abc.jpg',
      );

      const url = service.getImageUrl('1718000000000-abc.jpg');

      expect(url).toContain('1718000000000-abc.jpg');
      expect(mockFileRepository.getImageUrl).toHaveBeenCalledWith('1718000000000-abc.jpg');
    });
  });
});
