import { ApiResponse, ApiResponseData } from './api.response';

describe('ApiResponse', () => {
  describe('success', () => {
    it('should return a success response with default statusCode 200', () => {
      const result: ApiResponseData<string> = ApiResponse.success('hello');

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.data).toBe('hello');
      expect(result.message).toBe('Success');
      expect(result.timestamp).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should use a custom message and statusCode when provided', () => {
      const result = ApiResponse.success({ id: '1' }, 'Created', 201);

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(201);
      expect(result.message).toBe('Created');
      expect(result.data).toEqual({ id: '1' });
    });

    it('should include a valid ISO timestamp', () => {
      const before = new Date().toISOString();
      const result = ApiResponse.success(null);
      const after = new Date().toISOString();

      expect(result.timestamp >= before).toBe(true);
      expect(result.timestamp <= after).toBe(true);
    });
  });

  describe('error', () => {
    it('should return an error response with default statusCode 400', () => {
      const result: ApiResponseData<null> = ApiResponse.error('Something went wrong');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.data).toBeNull();
      expect(result.message).toBe('Something went wrong');
    });

    it('should include error detail when provided', () => {
      const errorDetail = { field: 'email', constraint: 'isEmail' };
      const result = ApiResponse.error('Validation failed', errorDetail, 422);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(422);
      expect(result.error).toEqual(errorDetail);
    });

    it('should include a valid ISO timestamp', () => {
      const before = new Date().toISOString();
      const result = ApiResponse.error('error');
      const after = new Date().toISOString();

      expect(result.timestamp >= before).toBe(true);
      expect(result.timestamp <= after).toBe(true);
    });
  });
});
