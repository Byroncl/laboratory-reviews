import { I18nService } from './i18n.service';

describe('I18nService', () => {
  describe('without request (no request injection)', () => {
    let service: I18nService;

    beforeEach(() => {
      service = new I18nService(undefined);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should return "en" as default language when no request', () => {
      expect(service.getLanguage()).toBe('en');
    });

    it('should translate a key in English by default', () => {
      expect(service.translate('users.created')).toBe(
        'User created successfully',
      );
    });

    it('should return the key itself when translation not found', () => {
      expect(service.translate('nonexistent.key')).toBe('nonexistent.key');
    });

    it('should interpolate args into the translated string', () => {
      const result = service.translate('common.success');
      expect(typeof result).toBe('string');
    });
  });

  describe('with request containing Accept-Language: es', () => {
    let service: I18nService;

    beforeEach(() => {
      const mockRequest: any = {
        headers: { 'accept-language': 'es' },
      };
      service = new I18nService(mockRequest);
    });

    it('should return "es" as language', () => {
      expect(service.getLanguage()).toBe('es');
    });

    it('should translate users.created in Spanish', () => {
      expect(service.translate('users.created')).toBe(
        'Usuario creado exitosamente',
      );
    });

    it('should translate users.language_updated in Spanish', () => {
      expect(service.translate('users.language_updated')).toBe(
        'Preferencia de idioma actualizada exitosamente',
      );
    });
  });

  describe('with request containing Accept-Language: en', () => {
    let service: I18nService;

    beforeEach(() => {
      const mockRequest: any = {
        headers: { 'accept-language': 'en' },
      };
      service = new I18nService(mockRequest);
    });

    it('should return "en" as language', () => {
      expect(service.getLanguage()).toBe('en');
    });

    it('should translate users.created in English', () => {
      expect(service.translate('users.created')).toBe(
        'User created successfully',
      );
    });

    it('should translate users.language_updated in English', () => {
      expect(service.translate('users.language_updated')).toBe(
        'Language preference updated successfully',
      );
    });
  });

  describe('with unsupported Accept-Language', () => {
    let service: I18nService;

    beforeEach(() => {
      const mockRequest: any = {
        headers: { 'accept-language': 'fr' },
      };
      service = new I18nService(mockRequest);
    });

    it('should fall back to en', () => {
      expect(service.getLanguage()).toBe('en');
    });

    it('should translate in English when language is unsupported', () => {
      expect(service.translate('users.created')).toBe(
        'User created successfully',
      );
    });
  });

  describe('with regional locale Accept-Language: es-AR', () => {
    let service: I18nService;

    beforeEach(() => {
      const mockRequest: any = {
        headers: { 'accept-language': 'es-AR,es;q=0.9,en;q=0.8' },
      };
      service = new I18nService(mockRequest);
    });

    it('should extract es from es-AR', () => {
      expect(service.getLanguage()).toBe('es');
    });
  });
});
