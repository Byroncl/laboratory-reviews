import { GlobalExceptionFilter } from './global-exception.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { TranslationService } from '../utils/translation.service';

function buildHost(url = '/test', lang = 'en'): ArgumentsHost {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });

  return {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({
        url,
        headers: { 'accept-language': lang },
      }),
    }),
  } as any;
}

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let translationService: jest.Mocked<TranslationService>;

  beforeEach(() => {
    translationService = {
      translate: jest.fn((key: string) => key),
    } as any;

    filter = new GlobalExceptionFilter(translationService);
  });

  it('should respond with the HttpException status and message', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
    const host = buildHost();
    const responseMock = (host.switchToHttp().getResponse() as any);

    filter.catch(exception, host);

    expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    const [body] = responseMock.status.mock.results[0].value.json.mock.calls[0];
    expect(body.success).toBe(false);
    expect(body.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(body.timestamp).toBeDefined();
    expect(body.path).toBe('/test');
  });

  it('should respond 500 for non-HttpException errors', () => {
    const exception = new Error('Unexpected crash');
    const host = buildHost();
    const responseMock = (host.switchToHttp().getResponse() as any);

    filter.catch(exception, host);

    expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    const [body] = responseMock.status.mock.results[0].value.json.mock.calls[0];
    expect(body.success).toBe(false);
    expect(body.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should extract message from HttpException object response', () => {
    const exception = new HttpException(
      { statusCode: 409, message: 'Conflict', error: 'DUPLICATE' },
      HttpStatus.CONFLICT,
    );
    const host = buildHost();
    const responseMock = (host.switchToHttp().getResponse() as any);

    filter.catch(exception, host);

    expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    const [body] = responseMock.status.mock.results[0].value.json.mock.calls[0];
    expect(body.message).toBe('Conflict');
  });
});
