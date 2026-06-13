import { I18nMiddleware } from './i18n.middleware';

describe('I18nMiddleware', () => {
  let middleware: I18nMiddleware;

  beforeEach(() => {
    middleware = new I18nMiddleware();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should set language to es when Accept-Language is es', () => {
    const req: any = {
      headers: { 'accept-language': 'es' },
      get: (header: string) =>
        header === 'accept-language' ? 'es' : undefined,
    };
    const res: any = { set: jest.fn() };
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.language).toBe('es');
    expect(res.set).toHaveBeenCalledWith('Content-Language', 'es');
    expect(next).toHaveBeenCalled();
  });

  it('should set language to en when Accept-Language is en', () => {
    const req: any = {
      headers: { 'accept-language': 'en' },
      get: (header: string) =>
        header === 'accept-language' ? 'en' : undefined,
    };
    const res: any = { set: jest.fn() };
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.language).toBe('en');
    expect(res.set).toHaveBeenCalledWith('Content-Language', 'en');
  });

  it('should default to en when Accept-Language is not supported', () => {
    const req: any = {
      headers: { 'accept-language': 'fr' },
      get: (header: string) =>
        header === 'accept-language' ? 'fr' : undefined,
    };
    const res: any = { set: jest.fn() };
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.language).toBe('en');
    expect(res.set).toHaveBeenCalledWith('Content-Language', 'en');
  });

  it('should default to en when no Accept-Language header is present', () => {
    const req: any = {
      headers: {},
      get: (_header: string) => undefined,
    };
    const res: any = { set: jest.fn() };
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.language).toBe('en');
  });

  it('should handle regional locale like es-AR by extracting es', () => {
    const req: any = {
      headers: { 'accept-language': 'es-AR,es;q=0.9' },
      get: (header: string) =>
        header === 'accept-language' ? 'es-AR,es;q=0.9' : undefined,
    };
    const res: any = { set: jest.fn() };
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.language).toBe('es');
  });
});
