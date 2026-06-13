import { AUTH_KEY, Auth, AuthOptions } from './auth.decorator';
import { SetMetadata } from '@nestjs/common';

describe('Auth Decorator', () => {
  describe('AUTH_KEY', () => {
    it('should be defined as a constant string', () => {
      expect(AUTH_KEY).toBeDefined();
      expect(typeof AUTH_KEY).toBe('string');
      expect(AUTH_KEY).toBe('auth_options');
    });
  });

  describe('Auth()', () => {
    it('should be a function', () => {
      expect(typeof Auth).toBe('function');
    });

    it('should return a decorator when called with no arguments', () => {
      const decorator = Auth();
      expect(decorator).toBeDefined();
      expect(typeof decorator).toBe('function');
    });

    it('should return a decorator when called with empty options', () => {
      const decorator = Auth({});
      expect(decorator).toBeDefined();
      expect(typeof decorator).toBe('function');
    });

    it('should return a decorator when called with roles option', () => {
      const decorator = Auth({ roles: ['user'] });
      expect(decorator).toBeDefined();
      expect(typeof decorator).toBe('function');
    });

    it('should accept AuthOptions with user role', () => {
      const options: AuthOptions = { roles: ['user'] };
      expect(() => Auth(options)).not.toThrow();
    });

    it('should accept AuthOptions with client role', () => {
      const options: AuthOptions = { roles: ['client'] };
      expect(() => Auth(options)).not.toThrow();
    });

    it('should accept AuthOptions with multiple roles', () => {
      const options: AuthOptions = { roles: ['user', 'client'] };
      expect(() => Auth(options)).not.toThrow();
    });

    it('should accept empty roles array', () => {
      const options: AuthOptions = { roles: [] };
      expect(() => Auth(options)).not.toThrow();
    });

    it('should apply to a class without throwing', () => {
      const decorator = Auth({ roles: ['user'] });
      expect(() => {
        @(decorator as ClassDecorator)
        class TestClass {}
      }).not.toThrow();
    });
  });
});
