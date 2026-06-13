import { HttpException, HttpStatus } from '@nestjs/common';

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, id?: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `${resource} not found${id ? ` with id ${id}` : ''}`,
        error: 'NOT_FOUND',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class DuplicateResourceException extends HttpException {
  constructor(resource: string, field: string, value: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: `${resource} with ${field} "${value}" already exists`,
        error: 'DUPLICATE_RESOURCE',
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class ValidationException extends HttpException {
  constructor(errors: unknown) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        errors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class AppUnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized') {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message,
        error: 'UNAUTHORIZED',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class AppForbiddenException extends HttpException {
  constructor(message: string = 'Forbidden') {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message,
        error: 'FORBIDDEN',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
