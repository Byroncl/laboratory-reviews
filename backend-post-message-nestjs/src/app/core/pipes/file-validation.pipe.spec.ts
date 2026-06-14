import { BadRequestException } from '@nestjs/common';
import { FileValidationPipe } from './file-validation.pipe';
import { TranslationService } from '../utils/translation.service';

const buildFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File => ({
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

describe('FileValidationPipe', () => {
  let pipe: FileValidationPipe;

  beforeEach(() => {
    const i18n = new TranslationService();
    pipe = new FileValidationPipe(i18n);
  });

  // ─── Existing image behaviour (regression) ─────────────────────────────────

  it('should pass a valid JPEG image through', () => {
    const file = buildFile({ mimetype: 'image/jpeg', size: 1024 });
    expect(pipe.transform(file)).toBe(file);
  });

  it('should pass a valid PNG image through', () => {
    const file = buildFile({ mimetype: 'image/png', size: 2048 });
    expect(pipe.transform(file)).toBe(file);
  });

  it('should reject image files exceeding 5MB', () => {
    const file = buildFile({ mimetype: 'image/jpeg', size: 6 * 1024 * 1024 });
    expect(() => pipe.transform(file)).toThrow(BadRequestException);
  });

  it('should throw when no file is provided', () => {
    expect(() => pipe.transform(undefined as any)).toThrow(BadRequestException);
  });

  // ─── New audio support (RED first) ─────────────────────────────────────────

  it('should pass a valid MP3 audio file', () => {
    const file = buildFile({ mimetype: 'audio/mpeg', originalname: 'track.mp3', size: 5 * 1024 * 1024 });
    expect(pipe.transform(file)).toBe(file);
  });

  it('should pass a valid WAV audio file', () => {
    const file = buildFile({ mimetype: 'audio/wav', originalname: 'track.wav', size: 10 * 1024 * 1024 });
    expect(pipe.transform(file)).toBe(file);
  });

  it('should pass a valid OGG audio file', () => {
    const file = buildFile({ mimetype: 'audio/ogg', originalname: 'track.ogg', size: 8 * 1024 * 1024 });
    expect(pipe.transform(file)).toBe(file);
  });

  it('should pass a valid WebM audio file up to 20MB', () => {
    const file = buildFile({ mimetype: 'audio/webm', originalname: 'track.webm', size: 20 * 1024 * 1024 });
    expect(pipe.transform(file)).toBe(file);
  });

  it('should reject audio files exceeding 20MB', () => {
    const file = buildFile({ mimetype: 'audio/mpeg', originalname: 'track.mp3', size: 21 * 1024 * 1024 });
    expect(() => pipe.transform(file)).toThrow(BadRequestException);
  });

  it('should reject unsupported MIME types like application/pdf', () => {
    const file = buildFile({ mimetype: 'application/pdf', originalname: 'doc.pdf' });
    expect(() => pipe.transform(file)).toThrow(BadRequestException);
  });

  it('should reject video/mp4 as unsupported type', () => {
    const file = buildFile({ mimetype: 'video/mp4', originalname: 'clip.mp4', size: 1024 });
    expect(() => pipe.transform(file)).toThrow(BadRequestException);
  });
});
