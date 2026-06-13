import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from '../services/files.service';
import { FileValidationPipe } from '../../../core/pipes/file-validation.pipe';
import { TranslationService } from '../../../core/utils/translation.service';

describe('FilesController', () => {
  let controller: FilesController;
  let mockFilesService: jest.Mocked<FilesService>;

  const buildFile = (
    overrides: Partial<Express.Multer.File> = {},
  ): Express.Multer.File => ({
    fieldname: 'file',
    originalname: 'photo.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('fake'),
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  });

  beforeEach(async () => {
    mockFilesService = {
      uploadImage: jest.fn(),
      deleteImage: jest.fn(),
      getImageUrl: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        { provide: FilesService, useValue: mockFilesService },
        {
          provide: TranslationService,
          useValue: { translate: jest.fn((key: string) => key) },
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('upload', () => {
    it('should upload a JPEG and return url and filename', async () => {
      const file = buildFile({ mimetype: 'image/jpeg' });
      const uploadResult = {
        url: 'http://localhost:9000/posts/1718-abc.jpg',
        filename: '1718-abc.jpg',
      };
      mockFilesService.uploadImage.mockResolvedValue(uploadResult);

      const response = await controller.upload(file);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(uploadResult);
      expect(mockFilesService.uploadImage).toHaveBeenCalledWith(file);
    });

    it('should upload a PNG and return url and filename', async () => {
      const file = buildFile({ mimetype: 'image/png', originalname: 'photo.png' });
      const uploadResult = {
        url: 'http://localhost:9000/posts/1718-abc.png',
        filename: '1718-abc.png',
      };
      mockFilesService.uploadImage.mockResolvedValue(uploadResult);

      const response = await controller.upload(file);

      expect(response.success).toBe(true);
      expect(response.data.url).toContain('.png');
    });

    it('should throw BadRequestException for non-image files via FileValidationPipe', () => {
      const i18n = new TranslationService();
      const pipe = new FileValidationPipe(i18n);
      const file = buildFile({ mimetype: 'application/pdf', originalname: 'doc.pdf' });

      expect(() => pipe.transform(file)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for files exceeding 5MB via FileValidationPipe', () => {
      const i18n = new TranslationService();
      const pipe = new FileValidationPipe(i18n);
      const file = buildFile({ size: 6 * 1024 * 1024 }); // 6MB

      expect(() => pipe.transform(file)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException when no file is provided via FileValidationPipe', () => {
      const i18n = new TranslationService();
      const pipe = new FileValidationPipe(i18n);

      expect(() => pipe.transform(undefined as any)).toThrow(BadRequestException);
    });
  });
});
