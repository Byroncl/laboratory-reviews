import { HttpStatus } from '@nestjs/common';
import {
  ResourceNotFoundException,
  DuplicateResourceException,
  ValidationException,
  AppUnauthorizedException,
  AppForbiddenException,
} from './app.exceptions';

describe('Custom Exceptions', () => {
  describe('ResourceNotFoundException', () => {
    it('should have 404 status and include resource name', () => {
      const exc = new ResourceNotFoundException('User', '123');

      expect(exc.getStatus()).toBe(HttpStatus.NOT_FOUND);
      const body = exc.getResponse() as any;
      expect(body.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(body.message).toContain('User');
      expect(body.message).toContain('123');
      expect(body.error).toBe('NOT_FOUND');
    });

    it('should work without an id', () => {
      const exc = new ResourceNotFoundException('Role');

      const body = exc.getResponse() as any;
      expect(body.message).toContain('Role');
      expect(body.message).not.toContain('undefined');
    });
  });

  describe('DuplicateResourceException', () => {
    it('should have 409 status and describe the conflicting field', () => {
      const exc = new DuplicateResourceException('User', 'email', 'foo@bar.com');

      expect(exc.getStatus()).toBe(HttpStatus.CONFLICT);
      const body = exc.getResponse() as any;
      expect(body.statusCode).toBe(HttpStatus.CONFLICT);
      expect(body.message).toContain('User');
      expect(body.message).toContain('email');
      expect(body.message).toContain('foo@bar.com');
      expect(body.error).toBe('DUPLICATE_RESOURCE');
    });
  });

  describe('ValidationException', () => {
    it('should have 400 status and include error details', () => {
      const errors = [{ field: 'email', message: 'must be valid' }];
      const exc = new ValidationException(errors);

      expect(exc.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      const body = exc.getResponse() as any;
      expect(body.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(body.message).toBe('Validation failed');
      expect(body.errors).toEqual(errors);
    });
  });

  describe('AppUnauthorizedException', () => {
    it('should have 401 status with default message', () => {
      const exc = new AppUnauthorizedException();

      expect(exc.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      const body = exc.getResponse() as any;
      expect(body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(body.message).toBe('Unauthorized');
      expect(body.error).toBe('UNAUTHORIZED');
    });

    it('should accept a custom message', () => {
      const exc = new AppUnauthorizedException('Token expired');

      const body = exc.getResponse() as any;
      expect(body.message).toBe('Token expired');
    });
  });

  describe('AppForbiddenException', () => {
    it('should have 403 status with default message', () => {
      const exc = new AppForbiddenException();

      expect(exc.getStatus()).toBe(HttpStatus.FORBIDDEN);
      const body = exc.getResponse() as any;
      expect(body.statusCode).toBe(HttpStatus.FORBIDDEN);
      expect(body.message).toBe('Forbidden');
      expect(body.error).toBe('FORBIDDEN');
    });
  });
});
