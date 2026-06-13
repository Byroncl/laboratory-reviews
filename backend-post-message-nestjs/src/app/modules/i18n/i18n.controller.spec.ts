import { Test, TestingModule } from '@nestjs/testing';
import { I18nController } from './i18n.controller';
import { I18nService } from '../../core/i18n/i18n.service';

describe('I18nController', () => {
  let controller: I18nController;
  let mockI18n: jest.Mocked<I18nService>;

  beforeEach(async () => {
    mockI18n = {
      getLanguage: jest.fn().mockReturnValue('en'),
      translate: jest.fn((key: string) => key),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [I18nController],
      providers: [{ provide: I18nService, useValue: mockI18n }],
    }).compile();

    controller = module.get<I18nController>(I18nController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCurrentLanguage', () => {
    it('should return the current language', () => {
      mockI18n.getLanguage.mockReturnValue('es');

      const result = controller.getCurrentLanguage();

      expect(result).toEqual({ language: 'es' });
      expect(mockI18n.getLanguage).toHaveBeenCalledTimes(1);
    });

    it('should return en by default', () => {
      mockI18n.getLanguage.mockReturnValue('en');

      const result = controller.getCurrentLanguage();

      expect(result).toEqual({ language: 'en' });
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return supported languages and current', () => {
      mockI18n.getLanguage.mockReturnValue('es');

      const result = controller.getSupportedLanguages();

      expect(result.supported).toEqual(['en', 'es']);
      expect(result.current).toBe('es');
    });
  });
});
